<?php

namespace App\Http\Controllers\API\Authentication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Authentication\ForgotPasswordRequest;
use App\Http\Requests\Authentication\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        return response()->json(['status' => $status]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password) {
            $user->password = Hash::make($password);
            $user->setRememberToken(Str::random(60));
            $user->save();
        });

        return response()->json(['status' => $status]);
    }
}
