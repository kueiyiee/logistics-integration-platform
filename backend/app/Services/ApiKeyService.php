<?php

namespace App\Services;

use App\Models\ApiKey;
use Illuminate\Support\Facades\Hash;

class ApiKeyService
{
    public function create(?int $companyId, int $createdBy, string $name, ?string $description, array $permissions = [], string $environment = 'production', ?\DateTimeInterface $expiresAt = null): array
    {
        $pair = ApiKey::generateKeyPair($environment);

        $secretHash = Hash::make($pair['secret']);
        $permissions = array_values(array_filter($permissions, fn ($permission) => is_string($permission) && trim($permission) !== ''));

        $apiKey = ApiKey::create([
            'company_id' => $companyId,
            'name' => $name,
            'description' => $description,
            'public_key' => $pair['public'],
            'key_prefix' => $pair['key_prefix'],
            'secret_hash' => $secretHash,
            'environment' => $environment,
            'permissions' => $permissions,
            'expires_at' => $expiresAt ? $expiresAt->format('Y-m-d H:i:s') : null,
            'created_by' => $createdBy,
        ]);

        return ['api_key' => $apiKey, 'secret' => $pair['secret']];
    }

    public function revoke(ApiKey $apiKey, int $byUserId): void
    {
        $apiKey->status = 'revoked';
        $apiKey->revoked_at = now();
        $apiKey->save();
    }

    public function regenerate(ApiKey $apiKey): string
    {
        $pair = ApiKey::generateKeyPair($apiKey->environment);
        $apiKey->public_key = $pair['public'];
        $apiKey->key_prefix = $pair['key_prefix'];
        $apiKey->secret_hash = Hash::make($pair['secret']);
        $apiKey->save();

        return $pair['secret'];
    }
}
