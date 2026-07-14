<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::query()
            ->where('company_id', $request->user()->company_id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json(['data' => $logs]);
    }
}
