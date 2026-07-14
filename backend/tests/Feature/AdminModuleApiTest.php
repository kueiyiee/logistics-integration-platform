<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Driver;
use App\Models\LoginHistory;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminModuleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function createCompanyWithAdmin(): array
    {
        $company = Company::create([
            'uuid' => 'company-' . uniqid(),
            'name' => 'Northwind',
            'slug' => 'northwind-' . uniqid(),
            'status' => 'active',
        ]);

        $admin = User::create([
            'company_id' => $company->id,
            'uuid' => 'user-' . uniqid(),
            'name' => 'Admin User',
            'email' => 'admin-' . uniqid() . '@example.com',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
            'email_verified_at' => now(),
            'approved_at' => now(),
        ]);

        $permissions = [
            'manage.api_keys' => 'Manage API keys',
            'manage.drivers' => 'Manage drivers',
            'manage.webhooks' => 'Manage webhooks',
            'view.audit_logs' => 'View audit logs',
        ];

        $role = Role::firstOrCreate(['name' => 'Admin'], ['description' => 'Admin', 'is_system' => false]);
        foreach ($permissions as $name => $description) {
            $permission = Permission::firstOrCreate(['name' => $name], ['description' => $description]);
            $role->permissions()->syncWithoutDetaching($permission->id);
        }
        $admin->roles()->syncWithoutDetaching($role->id);

        return [$company, $admin];
    }

    public function test_admin_can_create_and_list_drivers(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/drivers', [
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'phone' => '555-0100',
            'vehicle_type' => 'van',
            'vehicle_number' => 'ABC-123',
            'license_number' => 'DL-1001',
            'notes' => 'Preferred for urban routes',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Ada');

        $list = $this->getJson('/api/v1/admin/drivers');
        $list->assertStatus(200);
        $list->assertJsonFragment(['name' => 'Ada']);
        $this->assertDatabaseHas('drivers', ['license_number' => 'DL-1001']);
    }

    public function test_admin_can_create_api_key_with_permissions_and_revoke_it(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/api-keys', [
            'name' => 'Integration key',
            'purpose' => 'Used by the tracking service',
            'permissions' => ['deliveries.read', 'deliveries.write'],
            'expires_at' => now()->addDays(30)->toDateString(),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Integration key');
        $response->assertJsonPath('data.description', 'Used by the tracking service');
        $response->assertJsonPath('data.permissions.0', 'deliveries.read');
        $response->assertJsonPath('data.permissions.1', 'deliveries.write');
        $response->assertJsonPath('secret', fn ($value) => is_string($value) && strlen($value) > 0);
        $response->assertJsonMissing(['data' => ['secret_hash' => true]]);

        $this->assertDatabaseHas('api_keys', ['name' => 'Integration key']);

        $apiKey = ApiKey::latest()->first();
        $response = $this->deleteJson('/api/v1/admin/api-keys/' . $apiKey->id);
        $response->assertStatus(200);
        $this->assertSoftDeleted($apiKey);
    }

    public function test_admin_can_create_webhooks_with_retry_settings(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/webhooks', [
            'name' => 'Shipment alert',
            'target_url' => 'https://example.com/webhooks/delivery',
            'events' => ['delivery.created', 'delivery.completed'],
            'description' => 'Send delivery updates',
            'http_method' => 'POST',
            'retry_count' => 5,
            'timeout_seconds' => 20,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Shipment alert');
        $this->assertDatabaseHas('webhook_endpoints', ['name' => 'Shipment alert']);

        $endpoint = WebhookEndpoint::latest()->first();
        $this->assertSame(5, $endpoint->retry_count);
        $this->assertSame(20, $endpoint->timeout_seconds);
    }

    public function test_admin_can_regenerate_api_key_secret(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/api-keys', [
            'name' => 'Integration key',
            'description' => 'Used by the tracking service',
            'permissions' => ['deliveries.read', 'deliveries.write'],
            'expires_at' => now()->addDays(30)->toDateString(),
        ])->assertStatus(201);

        $apiKey = ApiKey::latest()->first();
        $response = $this->postJson('/api/v1/admin/api-keys/' . $apiKey->id . '/regenerate');

        $response->assertStatus(200);
        $response->assertJsonPath('data.secret', fn ($value) => is_string($value) && strlen($value) > 0);
    }

    public function test_admin_can_update_and_test_webhook_endpoint(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $this->withoutExceptionHandling();

        $endpointResponse = $this->postJson('/api/v1/admin/webhooks', [
            'name' => 'Shipment alert',
            'target_url' => 'https://example.com/webhooks/delivery',
            'events' => ['delivery.created'],
            'purpose' => 'Send delivery updates',
            'http_method' => 'POST',
            'retry_count' => 5,
            'timeout_seconds' => 20,
        ]);

        $endpointResponse->assertStatus(201);
        $endpoint = WebhookEndpoint::latest()->first();

        $this->patchJson('/api/v1/admin/webhooks/' . $endpoint->id, [
            'name' => 'Updated alert',
            'status' => 'inactive',
        ])->assertStatus(200)->assertJsonPath('data.name', 'Updated alert');

        
        $this->assertDatabaseHas('webhook_endpoints', ['name' => 'Updated alert', 'status' => 'inactive']);
    }

    public function test_admin_can_view_reports(): void
    {
        [, $admin] = $this->createCompanyWithAdmin();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports');
        $response->assertStatus(200);
        $response->assertJsonPath('data.0.title', 'Companies');
    }
}
