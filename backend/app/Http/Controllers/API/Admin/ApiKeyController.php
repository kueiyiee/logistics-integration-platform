<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Services\ApiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    protected ApiKeyService $service;

    public function __construct(ApiKeyService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $apiKeys = ApiKey::query()
            ->where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $apiKeys]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required_without:purpose', 'nullable', 'string'],
            'purpose' => ['required_without:description', 'nullable', 'string'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'max:255'],
            'environment' => ['nullable', 'in:production,test'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $description = $payload['description'] ?? $payload['purpose'] ?? null;
        $permissions = array_values(array_filter($payload['permissions'] ?? [], fn ($permission) => is_string($permission) && trim($permission) !== ''));

        $result = $this->service->create(
            $request->user()->company_id,
            $request->user()->id,
            $payload['name'],
            $description,
            $permissions,
            $payload['environment'] ?? 'production',
            isset($payload['expires_at']) && $payload['expires_at'] ? new \DateTime($payload['expires_at']) : null,
        );

        $this->recordAudit($request, 'created api key', [
            'api_key_id' => $result['api_key']->id,
            'name' => $result['api_key']->name,
        ]);

        return response()->json(['data' => $result['api_key'], 'secret' => $result['secret']], 201);
    }

    public function regenerate(Request $request, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $secret = $this->service->regenerate($apiKey);

        $this->recordAudit($request, 'regenerated api key', [
            'api_key_id' => $apiKey->id,
            'name' => $apiKey->name,
        ]);

        return response()->json(['data' => ['secret' => $secret]]);
    }

    public function destroy(Request $request, ApiKey $apiKey): JsonResponse
    {
        if ($apiKey->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $this->service->revoke($apiKey, $request->user()->id);
        $apiKey->update(['status' => 'revoked', 'revoked_at' => now()]);
        $apiKey->delete();

        $this->recordAudit($request, 'deleted api key', [
            'api_key_id' => $apiKey->id,
            'name' => $apiKey->name,
        ]);

        return response()->json(['message' => 'API key deleted']);
    }
}
