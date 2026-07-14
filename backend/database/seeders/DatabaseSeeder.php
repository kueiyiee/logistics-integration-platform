<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\Company;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureSystemAdministrator();

        // Remove legacy demo/admin seed accounts if they exist (do not touch real user/company data)
        User::whereIn('email', ['admin@acme.com', 'superadmin@acme.com', 'demo@acme.com'])->delete();

        // Completed seeding of platform owner and system role. Avoid creating demo
        // tenant users or sample credentials here to preserve actual tenant data.
    }

    protected function ensureSystemAdministrator(): void
    {
        $systemRole = Role::firstOrCreate(
            ['name' => config('platform.system_role_name', 'System Administrator')],
            ['description' => 'Permanent system owner role', 'is_system' => true]
        );

        $permissions = [
            'admin.access' => 'Access the admin console',
            'manage.api_keys' => 'Manage API keys',
            'manage.webhooks' => 'Manage webhook endpoints',
            'manage.drivers' => 'Manage drivers',
            'manage.deliveries' => 'Manage deliveries',
            'manage.customers' => 'Manage customers',
            'view.audit_logs' => 'View audit logs',
            'manage.settings' => 'Manage company settings',
            'client.access' => 'Access client features',
            'manage.system' => 'Full platform management',
        ];

        foreach ($permissions as $name => $description) {
            $permission = Permission::firstOrCreate(['name' => $name], ['description' => $description]);
            $systemRole->permissions()->syncWithoutDetaching($permission);
        }

        $existingSystemAdmin = User::where('email', 'systemadmin@d.com')->first();
        if ($existingSystemAdmin) {
            $existingSystemAdmin->forceFill([
                'company_id' => null,
                'uuid' => $existingSystemAdmin->uuid ?? Str::uuid()->toString(),
                'name' => 'System Administrator',
                'email' => 'systemadmin@d.com',
                'password' => Hash::make('Adminsite@21'),
                'status' => 'active',
                'is_system_owner' => true,
                'email_verified_at' => $existingSystemAdmin->email_verified_at ?? now(),
                'approved_at' => $existingSystemAdmin->approved_at ?? now(),
                'approved_by' => $existingSystemAdmin->approved_by ?? null,
            ])->saveQuietly();
            $existingSystemAdmin->refresh();
            $existingSystemAdmin->roles()->syncWithoutDetaching($systemRole);

            return;
        }

        User::create([
            'company_id' => null,
            'uuid' => Str::uuid()->toString(),
            'name' => 'System Administrator',
            'email' => 'systemadmin@d.com',
            'password' => Hash::make('Adminsite@21'),
            'status' => 'active',
            'is_system_owner' => true,
            'email_verified_at' => now(),
            'approved_at' => now(),
        ])->roles()->syncWithoutDetaching($systemRole);
    }
}