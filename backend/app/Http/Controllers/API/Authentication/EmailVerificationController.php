<?php

namespace App\Http\Controllers\API\Authentication;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired verification link.');
        }

        $user = User::findOrFail($request->query('id'));
        $token = (string) $request->query('token', '');

        if (sha1($user->getEmailForVerification()) !== $request->query('hash')) {
            abort(403, 'Invalid verification data.');
        }

        if ($user->email_verified_at) {
            abort(403, 'Email already verified.');
        }

        if ($token === '' || ! $user->consumeEmailVerification($token)) {
            abort(403, 'Invalid or expired verification link.');
        }

        $isSystemAdmin = strcasecmp($user->email, 'systemadmin@d.com') === 0 || $user->hasRole('Admin');

        $user->approved_at = $isSystemAdmin ? now() : $user->approved_at;
        $user->status = $isSystemAdmin ? 'active' : $user->status;
        $user->save();

        if ($isSystemAdmin) {
            return response()->json(['message' => 'Email verified. Your System Admin account is active and ready to sign in.']);
        }

        // TODO: notify admins about pending approval (separate task)

        return response()->json(['message' => 'Email verified. Your account is pending administrator approval.']);
    }
}
