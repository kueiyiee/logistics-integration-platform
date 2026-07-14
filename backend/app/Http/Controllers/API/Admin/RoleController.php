<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        // Tenant admin should not see or manage protected system roles
        $roles = Role::with('permissions')->whereIn('name', ['Admin', 'client'])->where('is_system', false)->get();

        return response()->json(['data' => $roles]);
    }
}
