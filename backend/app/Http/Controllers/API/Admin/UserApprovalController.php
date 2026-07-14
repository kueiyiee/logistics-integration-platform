<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserApprovalController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('company_id', $request->user()->company_id)
            ->whereIn('status', ['pending_verification', 'pending_approval'])
            ->get(['id', 'name', 'email', 'company_id', 'created_at', 'email_verified_at', 'status']);

        return response()->json(['data' => $users]);
    }

    public function approve(Request $request, User $user)
    {
        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $user->approved_at = now();
        $user->approved_by = $request->user()->id;
        $user->status = 'active';
        $user->save();

        // TODO: notify user about approval

        return response()->json(['message' => 'User approved', 'user' => $user]);
    }

    public function reject(Request $request, User $user)
    {
        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $payload = $request->validate(['note' => ['nullable', 'string']]);

        $user->status = 'rejected';
        $user->approval_notes = $payload['note'] ?? null;
        $user->save();

        // TODO: notify user about rejection

        return response()->json(['message' => 'User rejected', 'user' => $user]);
    }

    public function resendVerification(Request $request, User $user)
    {
        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified']);
        }

        if ($user->verification_sent_at && $user->verification_sent_at->gt(now()->subMinutes(2))) {
            return response()->json(['message' => 'Please wait a few moments before requesting another verification email.'], 429);
        }

        $token = $user->beginEmailVerification();
        \Illuminate\Support\Facades\Notification::send($user, new \App\Notifications\QueuedVerifyEmail($token));

        return response()->json(['message' => 'Verification email resent']);
    }
}
