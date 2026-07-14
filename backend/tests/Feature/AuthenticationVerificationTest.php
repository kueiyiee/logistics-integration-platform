<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthenticationVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_rejects_duplicate_emails_case_insensitively(): void
    {
        Company::create([
            'uuid' => 'company-' . uniqid(),
            'name' => 'Acme Logistics',
            'slug' => 'acme-logistics-' . uniqid(),
            'status' => 'active',
        ]);

        User::create([
            'company_id' => Company::latest()->first()->id,
            'uuid' => 'user-' . uniqid(),
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => bcrypt('Secret123!'),
            'status' => 'active',
            'email_verified_at' => now(),
            'approved_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'company_name' => 'Northwind Delivery',
            'name' => 'New User',
            'email' => 'EXISTING@EXAMPLE.COM',
            'password' => 'Secret123!',
            'password_confirmation' => 'Secret123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'That email address is already registered. Please use a different email or sign in if you already have an account.']);
    }

    public function test_verification_link_can_only_be_used_once(): void
    {
        $company = Company::create([
            'uuid' => 'company-' . uniqid(),
            'name' => 'Momentum Logistics',
            'slug' => 'momentum-logistics-' . uniqid(),
            'status' => 'active',
        ]);

        $user = User::create([
            'company_id' => $company->id,
            'uuid' => 'verify-' . uniqid(),
            'name' => 'Verifier',
            'email' => 'verify@example.com',
            'password' => bcrypt('Secret123!'),
            'status' => 'pending_verification',
        ]);

        $token = $user->beginEmailVerification();

        $verificationUrl = URL::temporarySignedRoute(
            'api.v1.auth.verify-email',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification()), 'token' => $token]
        );

        $firstResponse = $this->get($verificationUrl);
        $firstResponse->assertOk();

        $secondResponse = $this->get($verificationUrl);
        $secondResponse->assertStatus(403);
    }
}
