<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('roles.permissions')
            ->where('company_id', $request->user()->company_id)
            ->get();

        return response()->json(['data' => $users]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $payload = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $role = Role::where('name', $payload['role'])->firstOrFail();

        // Prevent assigning system roles to tenant users
        if ($role->is_system) {
            abort(403, 'Cannot assign protected system role to tenant users.');
        }

        $user->roles()->syncWithoutDetaching($role);

        $this->recordAudit($request, 'assigned role', [
            'user_id' => $user->id,
            'role' => $role->name,
        ]);

        return response()->json(['data' => $user->load('roles.permissions')]);
    }

    public function destroy(Request $request, User $user, Role $role): JsonResponse
    {
        if ($user->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $user->roles()->detach($role);

        $this->recordAudit($request, 'removed role', [
            'user_id' => $user->id,
            'role' => $role->name,
        ]);

        return response()->json(['message' => 'Role removed']);
    }
}
