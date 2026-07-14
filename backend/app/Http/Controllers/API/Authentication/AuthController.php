<?php

namespace App\Http\Controllers\API\Authentication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Authentication\LoginRequest;
use App\Models\User;
use App\Services\Authentication\AuthenticationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(LoginRequest $request, AuthenticationService $service): JsonResponse
    {
        Log::info('AuthController@login received request', ['email' => $request->input('email')]);
        $data = $request->validated();
        $key = 'login_attempt|' . Str::lower($data['email']) . '|' . $request->ip();
        $max = config('auth.lockout.attempts_rate_limit', 10);
        if (RateLimiter::tooManyAttempts($key, $max)) {
            Log::warning('AuthController@login rate limited', ['key' => $key]);
            return response()->json(['message' => 'Too many login attempts. Please try again later or contact support.'], 429);
        }
        Log::info('AuthController@login validated request', ['email' => $data['email']]);
        $result = $service->authenticate($data);

        if (isset($result['mfa_required']) && $result['mfa_required']) {
            return response()->json([
                'success' => true,
                'mfa_required' => true,
                'challenge_token' => $result['challenge_token'],
            ]);
        }

        $token = $result['token'];
        $user = $result['user'];

        $response = [
            'success' => true,
            'token' => $token,
            'user' => $user ? $user->only(['id', 'name', 'email', 'status']) : null,
        ];

        Log::info('AuthController@login returning', ['response' => $response]);

        return response()->json($response);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->letters()->numbers()->symbols()],
            'password_confirmation' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing([
            'roles:id,name',
            'roles.permissions:id,name',
            'company:id,name',
        ]);

        // mark whether this user is the configured system owner
        $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
        $user->setAttribute('is_system_owner', strcasecmp($user->email, $systemEmail) === 0 || $user->roles->contains('is_system', true));

        return response()->json(['user' => $user]);
    }
}
