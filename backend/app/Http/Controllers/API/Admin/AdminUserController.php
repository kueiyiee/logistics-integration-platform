<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'string', 'max:255'],
        ]);

        $roleName = $payload['role'] ?? 'client';
        $role = $this->ensureRole($roleName);

        $user = User::create([
            'company_id' => $request->user()->company_id,
            'uuid' => Str::uuid()->toString(),
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'status' => 'active',
            'email_verified_at' => now(),
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        $user->roles()->syncWithoutDetaching($role);

        $this->recordAudit($request, 'created user', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $roleName,
        ]);

        return response()->json(['data' => $user->load('roles.permissions')]);
    }

    protected function ensureRole(string $roleName): Role
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['description' => ucfirst($roleName) . ' access', 'is_system' => false]
        );

        if ($roleName === 'Admin') {
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
                $permission = Permission::firstOrCreate(['name' => $name], ['description' => $description]);
                $role->permissions()->syncWithoutDetaching($permission);
            }
        }

        if ($roleName === 'client') {
            $permission = Permission::firstOrCreate(['name' => 'client.access'], ['description' => 'Access client features']);
            $role->permissions()->syncWithoutDetaching($permission);
        }

        return $role;
    }

    public function suspend(Request $request, User $user)
    {
        $this->protectSystemAdministrator($user);
        $this->authorizeCompany($request, $user);

        $user->status = 'suspended';
        $user->save();

        $this->recordAudit($request, 'suspended user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User suspended', 'user' => $user]);
    }

    public function activate(Request $request, User $user)
    {
        $this->protectSystemAdministrator($user);
        $this->authorizeCompany($request, $user);

        $user->status = 'active';
        $user->save();

        $this->recordAudit($request, 'activated user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User activated', 'user' => $user]);
    }

    public function lock(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        $user->locked_until = now()->addHours(24);
        $user->save();

        $this->recordAudit($request, 'locked user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User locked', 'user' => $user]);
    }

    public function unlock(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        $user->locked_until = null;
        $user->failed_login_attempts = 0;
        $user->save();

        $this->recordAudit($request, 'unlocked user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User unlocked', 'user' => $user]);
    }

    public function disable(Request $request, User $user)
    {
        $this->protectSystemAdministrator($user);
        $this->authorizeCompany($request, $user);

        $user->status = 'disabled';
        $user->save();

        $this->recordAudit($request, 'disabled user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User disabled', 'user' => $user]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->protectSystemAdministrator($user);
        $this->authorizeCompany($request, $user);

        $user->delete();

        $this->recordAudit($request, 'deleted user', ['user_id' => $user->id]);

        return response()->json(['message' => 'User deleted']);
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        // send password reset link via the broker
        $status = Password::sendResetLink(['email' => $user->email]);

        $this->recordAudit($request, 'sent password reset', ['user_id' => $user->id, 'status' => $status]);

        return response()->json(['message' => 'Password reset link sent']);
    }

    public function forceResetPassword(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        $payload = $request->validate(['password' => ['required', 'string', 'min:8']]);

        $user->password = Hash::make($payload['password']);
        $user->last_password_changed_at = now();
        $user->save();

        // revoke sessions
        \DB::table('personal_access_tokens')->where('tokenable_id', $user->id)->delete();
        \DB::table('user_sessions')->where('user_id', $user->id)->update(['revoked' => true]);

        $this->recordAudit($request, 'force reset password', ['user_id' => $user->id]);

        return response()->json(['message' => 'Password reset and user sessions terminated']);
    }

    public function terminateSessions(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        \DB::table('personal_access_tokens')->where('tokenable_id', $user->id)->delete();
        \DB::table('user_sessions')->where('user_id', $user->id)->update(['revoked' => true]);

        $this->recordAudit($request, 'terminated sessions', ['user_id' => $user->id]);

        return response()->json(['message' => 'User sessions terminated']);
    }

    public function sessions(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        $sessions = \App\Models\UserSession::where('user_id', $user->id)->get();

        return response()->json(['data' => $sessions]);
    }

    public function revokeSession(Request $request, $sessionId)
    {
        $session = \App\Models\UserSession::findOrFail($sessionId);

        $this->authorizeCompany($request, $session->user);

        $session->revoked = true;
        $session->save();

        // remove related personal access tokens
        \DB::table('personal_access_tokens')->where('tokenable_id', $session->user_id)->delete();

        $this->recordAudit($request, 'revoked session', ['session_id' => $session->id, 'user_id' => $session->user_id]);

        return response()->json(['message' => 'Session revoked']);
    }

    public function loginHistory(Request $request, User $user)
    {
        $this->authorizeCompany($request, $user);

        $history = \App\Models\LoginHistory::where('user_id', $user->id)->orderByDesc('occurred_at')->limit(100)->get();

        return response()->json(['data' => $history]);
    }

    protected function authorizeCompany(Request $request, User $user): void
    {
        // Prevent tenant admins from operating on protected system users
        $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
        if (strcasecmp($user->email, $systemEmail) === 0 || $user->roles()->where('is_system', true)->exists()) {
            abort(403, 'Unauthorized');
        }

        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }
    }

    protected function protectSystemAdministrator(User $user): void
    {
        if ($user->is_system_owner || strcasecmp($user->email, config('platform.system_owner_email', 'systemadmin@d.com')) === 0) {
            abort(403, 'Protected system administrator account cannot be modified.');
        }
    }
}
