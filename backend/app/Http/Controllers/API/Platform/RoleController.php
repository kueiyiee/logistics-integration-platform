<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->orderBy('name')->get();

        return response()->json(['data' => $roles]);
    }
}
