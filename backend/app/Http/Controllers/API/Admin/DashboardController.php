<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $metrics = Cache::remember('admin:dashboard:metrics', 15, function () {
            return [
                'users' => User::count(),
                'deliveries' => Delivery::count(),
                'customers' => Customer::count(),
                'drivers' => Driver::count(),
                'api_keys' => ApiKey::count(),
                'webhooks' => WebhookEndpoint::count(),
            ];
        });

        return response()->json(['metrics' => $metrics]);
    }

    public function security(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $metrics = Cache::remember("admin:security:metrics:{$companyId}", 15, function () use ($companyId) {
            return [
                'audit_events' => AuditLog::where('company_id', $companyId)->count(),
                'active_api_keys' => ApiKey::where('company_id', $companyId)
                    ->where('status', 'active')
                    ->count(),
                'recent_webhooks' => WebhookEndpoint::where('company_id', $companyId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ];
        });

        return response()->json(['metrics' => $metrics]);
    }
}
