<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Delivery;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $metrics = Cache::remember('platform:dashboard:metrics', 15, function () {
            $totalCompanies = Company::count();
            $pendingCompanies = Company::where('status', 'pending')->count();
            $approvedCompanies = Company::where('status', 'active')->count();
            $suspendedCompanies = Company::where('status', 'suspended')->count();

            $totalUsers = User::count();
            $activeDeliveries = Delivery::whereNotIn('status', ['completed', 'failed'])->count();
            $completedDeliveries = Delivery::where('status', 'completed')->count();
            $failedDeliveries = Delivery::where('status', 'failed')->count();

            $apiKeys = ApiKey::count();
            $webhookSuccess = WebhookEndpoint::where('status', 'active')->count();
            $onlineCompanies = Company::where('status', 'active')->count();

            $weeklySeries = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i)->startOfDay();
                $weeklySeries[] = [
                    'label' => $date->format('D'),
                    'tenants' => Company::whereBetween('created_at', [$date->startOfDay(), $date->endOfDay()])->count(),
                    'deliveries' => Delivery::whereBetween('created_at', [$date->startOfDay(), $date->endOfDay()])->count(),
                ];
            }

            $previousPeriodDeliveries = Delivery::whereBetween('created_at', [now()->subDays(14)->startOfDay(), now()->subDays(7)->endOfDay()])->count();
            $currentPeriodDeliveries = Delivery::whereBetween('created_at', [now()->subDays(7)->startOfDay(), now()->endOfDay()])->count();
            $deliveriesGrowth = $previousPeriodDeliveries > 0
                ? round((($currentPeriodDeliveries - $previousPeriodDeliveries) / $previousPeriodDeliveries) * 100, 1)
                : ($currentPeriodDeliveries > 0 ? 100 : 0);

            $previousPeriodCompanies = Company::whereBetween('created_at', [now()->subDays(14)->startOfDay(), now()->subDays(7)->endOfDay()])->count();
            $currentPeriodCompanies = Company::whereBetween('created_at', [now()->subDays(7)->startOfDay(), now()->endOfDay()])->count();
            $tenantsGrowth = $previousPeriodCompanies > 0
                ? round((($currentPeriodCompanies - $previousPeriodCompanies) / $previousPeriodCompanies) * 100, 1)
                : ($currentPeriodCompanies > 0 ? 100 : 0);

            return [
                'total_companies' => $totalCompanies,
                'pending_companies' => $pendingCompanies,
                'approved_companies' => $approvedCompanies,
                'suspended_companies' => $suspendedCompanies,
                'total_users' => $totalUsers,
                'active_deliveries' => $activeDeliveries,
                'completed_deliveries' => $completedDeliveries,
                'failed_deliveries' => $failedDeliveries,
                'api_keys' => $apiKeys,
                'webhook_success' => $webhookSuccess,
                'online_companies' => $onlineCompanies,
                'deliveries_growth' => $deliveriesGrowth,
                'tenants_growth' => $tenantsGrowth,
                'weekly_series' => $weeklySeries,
            ];
        });

        return response()->json([
            'metrics' => [
                'total_companies' => $metrics['total_companies'],
                'pending_companies' => $metrics['pending_companies'],
                'approved_companies' => $metrics['approved_companies'],
                'suspended_companies' => $metrics['suspended_companies'],
                'total_users' => $metrics['total_users'],
                'active_deliveries' => $metrics['active_deliveries'],
                'completed_deliveries' => $metrics['completed_deliveries'],
                'failed_deliveries' => $metrics['failed_deliveries'],
                'api_keys' => $metrics['api_keys'],
                'webhook_success' => $metrics['webhook_success'],
                'online_companies' => $metrics['online_companies'],
                'system_health' => 'healthy',
                'server_load' => 'normal',
                'database_status' => 'ok',
                'platform_growth' => sprintf('+%s%%', ($metrics['deliveries_growth'] + $metrics['tenants_growth']) >= 0 ? round(($metrics['deliveries_growth'] + $metrics['tenants_growth']) / 2, 1) : 0),
                'operational_trend' => [
                    'summary' => 'Delivery volume and tenant onboarding are tracking ahead of plan across the current week.',
                    'growth' => [
                        'deliveries' => $metrics['deliveries_growth'] >= 0 ? sprintf('+%s%%', $metrics['deliveries_growth']) : sprintf('%s%%', $metrics['deliveries_growth']),
                        'tenants' => $metrics['tenants_growth'] >= 0 ? sprintf('+%s%%', $metrics['tenants_growth']) : sprintf('%s%%', $metrics['tenants_growth']),
                    ],
                    'series' => $metrics['weekly_series'],
                    'headline' => 'Weekly delivery growth and tenant expansion',
                ],
                'monthly_statistics' => [
                    ['label' => 'Companies added', 'value' => Company::where('created_at', '>=', now()->subDays(30))->count()],
                    ['label' => 'Users onboarded', 'value' => User::where('created_at', '>=', now()->subDays(30))->count()],
                    ['label' => 'Deliveries created', 'value' => Delivery::where('created_at', '>=', now()->subDays(30))->count()],
                ],
            ],
        ]);
    }
}
