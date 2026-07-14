<?php

namespace App\Services\Authentication;

use App\Models\Company;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class AuthenticationService
{
    public function authenticate(array $data): array
    {
        // use normalized email for indexed lookup (email stored normalized)
        $user = User::select(['id', 'company_id', 'email', 'password', 'status', 'failed_login_attempts', 'locked_until', 'mfa_enabled'])
            ->where('email', User::normalizeEmail($data['email']))
            ->first();

        if (! $user) {
            Log::warning('AuthenticationService@authenticate failed - user not found', ['email' => $data['email']]);
            abort(401, 'Invalid credentials');
        }

        $check = Hash::check($data['password'], $user->password);

        if (! $check) {
            $user->increment('failed_login_attempts');

            $threshold = config('auth.lockout.failed_attempts', 5);
            $lockMinutes = config('auth.lockout.lock_minutes', 15);

            if ($user->failed_login_attempts >= $threshold) {
                $user->locked_until = now()->addMinutes($lockMinutes);
                $user->failed_login_attempts = 0;
            }

            $user->save();

            // increase IP/email rate limiter
            $key = 'login_attempt|' . strtolower($data['email']) . '|' . request()->ip();
            RateLimiter::hit($key, $lockMinutes * 60);

            // record login history
            \App\Models\LoginHistory::create([
                'user_id' => $user->id,
                'company_id' => $user->company_id,
                'ip_address' => request()->ip(),
                'browser' => request()->header('User-Agent'),
                'success' => false,
                'reason' => 'invalid_credentials',
                'metadata' => ['payload_present' => isset($data['password'])],
            ]);

            abort(401, 'Invalid credentials');
        }

        // check login rules
        $reason = null;
        if (! $user->canLogin($reason)) {
            $messageMap = [
                'email_not_verified' => 'Your email has not been verified.',
                'pending_approval' => 'Your account is awaiting administrator approval.',
                'not_active' => 'Your account is not active.',
                'locked' => 'Your account is locked due to multiple failed login attempts.',
                'suspended' => 'Your account has been suspended.',
                'disabled' => 'Your account has been disabled.',
            ];

            $message = $messageMap[$reason] ?? 'Unable to login with provided credentials.';

            \App\Models\LoginHistory::create([
                'user_id' => $user->id,
                'company_id' => $user->company_id,
                'ip_address' => request()->ip(),
                'browser' => request()->header('User-Agent'),
                'success' => false,
                'reason' => $reason,
            ]);

            abort(403, $message);
        }

        // successful login: reset counters
        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->save();

        // clear rate limiter for this identifier
        try {
            $key = 'login_attempt|' . strtolower($data['email']) . '|' . request()->ip();
            RateLimiter::clear($key);
        } catch (\Exception $e) {
            Log::warning('Failed to clear login rate limiter', ['error' => $e->getMessage()]);
        }

        // If user has MFA enabled, create a short-lived MFA challenge and require verification
        if ($user->mfa_enabled) {
            $challengeToken = Str::random(48);
            \App\Models\MfaChallenge::create([
                'user_id' => $user->id,
                'token' => $challengeToken,
                'expires_at' => now()->addMinutes(10),
            ]);

            \App\Models\LoginHistory::create([
                'user_id' => $user->id,
                'company_id' => $user->company_id,
                'ip_address' => request()->ip(),
                'browser' => request()->header('User-Agent'),
                'success' => true,
                'reason' => 'mfa_required',
            ]);

            return ['mfa_required' => true, 'challenge_token' => $challengeToken, 'user' => $user];
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // create session record
        \App\Models\UserSession::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'uuid' => (string) Str::uuid(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'last_activity' => now(),
            'expires_at' => now()->addDays(config('session.lifetime', 120)),
        ]);

        \App\Models\LoginHistory::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'ip_address' => request()->ip(),
            'browser' => request()->header('User-Agent'),
            'success' => true,
            'reason' => 'authenticated',
        ]);

        Log::info('AuthenticationService@authenticate created token', ['token_snippet' => substr($token, 0, 8) . '...']);

        return ['token' => $token, 'user' => $user];
    }

    public function register(array $data): User
    {
        $normalizedEmail = User::normalizeEmail($data['email']);
        $existingUser = User::where('email', $normalizedEmail)->first();

        if ($existingUser) {
            abort(422, 'That email address is already registered. Please use a different email or sign in if you already have an account.');
        }

        $company = Company::create([
            'uuid' => Str::uuid()->toString(),
            'name' => $data['company_name'],
            'slug' => $this->createUniqueCompanySlug($data['company_name']),
            'status' => 'pending',
        ]);

        $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
        $isSystemAdmin = strcasecmp($normalizedEmail, $systemEmail) === 0;

        // Prevent runtime creation of additional system owner accounts via API
        if ($isSystemAdmin && ! app()->runningInConsole()) {
            // If the system owner already exists, ensure we don't create a duplicate
            $existing = User::where('email', $systemEmail)->first();
            if ($existing) {
                abort(403, 'Registration with the platform owner email is restricted.');
            }
        }

        $user = User::create([
            'company_id' => $company->id,
            'uuid' => Str::uuid()->toString(),
            'name' => $data['name'],
            'email' => $normalizedEmail,
            'password' => Hash::make($data['password']),
            'status' => $isSystemAdmin ? 'active' : 'pending_verification',
            'email_verified_at' => $isSystemAdmin ? now() : null,
            'approved_at' => $isSystemAdmin ? now() : null,
        ]);

        if (! $isSystemAdmin) {
            $user->status = 'pending_approval';
            $user->save();
        }

        if (! $isSystemAdmin) {
            // send queued verification email for normal registrations
            try {
                $token = $user->beginEmailVerification();
                \Illuminate\Support\Facades\Notification::send($user, new \App\Notifications\QueuedVerifyEmail($token));
            } catch (\Exception $e) {
                Log::error('Failed to queue verification email', ['error' => $e->getMessage(), 'user' => $user->email]);
            }

            // Notify the system owner that a new company/user requires approval
            try {
                $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
                $systemOwner = User::where('email', $systemEmail)->first();
                if ($systemOwner) {
                    \Illuminate\Support\Facades\Notification::send($systemOwner, new \App\Notifications\NewRegistrationForApproval($user));
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify system owner of new registration', ['error' => $e->getMessage(), 'user' => $user->email]);
            }
        }

        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin'],
            ['description' => 'System administrator']
        );

        $permissions = [
            'admin.access' => 'Access the admin console',
            'manage.api_keys' => 'Manage API keys',
            'manage.webhooks' => 'Manage webhook endpoints',
            'manage.drivers' => 'Manage drivers',
            'manage.deliveries' => 'Manage deliveries',
            'manage.customers' => 'Manage customers',
            'view.audit_logs' => 'View audit logs',
            'manage.settings' => 'Manage company settings',
            'client.access' => 'Access client features',
        ];

        foreach ($permissions as $name => $description) {
            $permission = Permission::firstOrCreate(
                ['name' => $name],
                ['description' => $description]
            );

            $adminRole->permissions()->syncWithoutDetaching($permission);
        }

        $user->roles()->syncWithoutDetaching($adminRole);

        return $user;
    }

    private function createUniqueCompanySlug(string $companyName): string
    {
        $baseSlug = Str::slug($companyName);
        $slug = $baseSlug;
        $counter = 1;

        while (Company::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
