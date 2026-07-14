<?php

namespace App\Http\Controllers\API\Authentication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Authentication\RegisterRequest;
use App\Services\Authentication\AuthenticationService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function register(RegisterRequest $request, AuthenticationService $service): JsonResponse
    {
        $payload = $request->validated();

        $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
        if (strcasecmp($payload['email'] ?? '', $systemEmail) === 0 && ! app()->runningInConsole()) {
            abort(403, 'Registration with the platform owner email is not allowed.');
        }

        $user = $service->register($payload);

        $message = strcasecmp($user->email, $systemEmail) === 0
            ? 'Registration successful. Your System Admin account is active and can sign in immediately without email verification.'
            : 'Registration successful. Please verify your email. Once your administrator approves your account, you can sign in to your professional dashboard.';

        return response()->json([
            'message' => $message,
            'user' => $user->only(['id', 'name', 'email', 'status', 'company_id']),
        ], 201);
    }
}
