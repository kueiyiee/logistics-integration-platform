<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::orderBy('name')->get();

        return response()->json(['data' => $permissions]);
    }
}
