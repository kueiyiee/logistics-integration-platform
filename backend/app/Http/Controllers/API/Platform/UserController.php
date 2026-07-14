<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with(['company', 'roles.permissions'])->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $users]);
    }

    public function storeRole(Request $request, User $user): JsonResponse
    {
        $payload = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $role = Role::where('name', $payload['role'])->firstOrFail();

        // Prevent accidental assignment of system-only roles to tenant users. Only allow assigning
        // system roles if the target user is the configured system owner.
        if ($role->is_system) {
            $systemEmail = config('platform.system_owner_email', 'systemadmin@d.com');
            if (strcasecmp($user->email, $systemEmail) !== 0) {
                abort(403, 'Cannot assign protected system role to this user.');
            }
        }

        $user->roles()->syncWithoutDetaching($role);

        $this->recordAudit($request, 'assigned role', [
            'user_id' => $user->id,
            'role' => $role->name,
        ]);

        return response()->json(['data' => $user->load('roles.permissions')]);
    }

    public function destroyRole(Request $request, User $user, Role $role): JsonResponse
    {
        $user->roles()->detach($role);

        $this->recordAudit($request, 'removed role', [
            'user_id' => $user->id,
            'role' => $role->name,
        ]);

        return response()->json(['message' => 'Role removed']);
    }
}
