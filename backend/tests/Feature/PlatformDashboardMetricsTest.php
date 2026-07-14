<?php

namespace Tests\Feature;

use App\Http\Controllers\API\Platform\DashboardController;
use App\Models\Company;
use App\Models\Delivery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformDashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_contains_real_operational_trend_metrics(): void
    {
        $company = Company::create([
            'uuid' => 'company-' . uniqid(),
            'name' => 'Northwind Express',
            'slug' => 'northwind-express-' . uniqid(),
            'status' => 'active',
            'created_at' => now()->subDays(4),
        ]);

        Company::create([
            'uuid' => 'company-' . uniqid(),
            'name' => 'Blue Harbor',
            'slug' => 'blue-harbor-' . uniqid(),
            'status' => 'active',
            'created_at' => now()->subDays(2),
        ]);

        Delivery::create([
            'company_id' => $company->id,
            'uuid' => 'delivery-' . uniqid(),
            'tracking_number' => 'TRK-1001',
            'external_reference' => 'EXT-1001',
            'status' => 'completed',
            'created_at' => now()->subDays(3),
        ]);

        Delivery::create([
            'company_id' => $company->id,
            'uuid' => 'delivery-' . uniqid(),
            'tracking_number' => 'TRK-1002',
            'external_reference' => 'EXT-1002',
            'status' => 'in_transit',
            'created_at' => now()->subDays(1),
        ]);

        $response = (new DashboardController())->index();
        $payload = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('operational_trend', $payload['metrics']);
        $this->assertNotEmpty($payload['metrics']['operational_trend']['series']);
        $this->assertArrayHasKey('deliveries', $payload['metrics']['operational_trend']['growth']);
        $this->assertArrayHasKey('tenants', $payload['metrics']['operational_trend']['growth']);
    }
}
