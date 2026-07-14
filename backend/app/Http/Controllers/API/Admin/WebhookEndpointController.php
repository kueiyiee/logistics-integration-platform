<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DeliverWebhookJob;
use App\Models\WebhookEndpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

class WebhookEndpointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $endpoints = WebhookEndpoint::query()
            ->where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $endpoints]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required_without:purpose', 'nullable', 'string'],
            'purpose' => ['required_without:description', 'nullable', 'string'],
            'target_url' => ['required', 'url', 'max:1024'],
            'http_method' => ['nullable', 'in:POST,GET,PUT,PATCH,DELETE'],
            'retry_count' => ['nullable', 'integer', 'min:0', 'max:10'],
            'timeout_seconds' => ['nullable', 'integer', 'min:1', 'max:60'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string', 'max:255'],
        ]);

        $description = $data['description'] ?? $data['purpose'] ?? null;
        $events = array_values(array_filter($data['events'], fn ($event) => is_string($event) && trim($event) !== ''));

        $generatedSecret = WebhookEndpoint::generateSecret();

        $endpoint = WebhookEndpoint::create([
            'company_id' => $request->user()->company_id,
            'name' => $data['name'],
            'description' => $description,
            'target_url' => $data['target_url'],
            'http_method' => $data['http_method'] ?? 'POST',
            'retry_count' => $data['retry_count'] ?? 3,
            'timeout_seconds' => $data['timeout_seconds'] ?? 10,
            'secret_cipher' => Crypt::encryptString($generatedSecret),
            'status' => 'active',
            'events' => $events,
            'created_by' => $request->user()->id,
        ]);

        $this->recordAudit($request, 'created webhook endpoint', [
            'webhook_id' => $endpoint->id,
            'name' => $endpoint->name,
        ]);

        return response()->json(['data' => $endpoint, 'secret' => $generatedSecret], 201);
    }

    public function update(Request $request, WebhookEndpoint $webhookEndpoint): JsonResponse
    {
        if ($webhookEndpoint->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'purpose' => ['nullable', 'string'],
            'target_url' => ['nullable', 'url', 'max:1024'],
            'http_method' => ['nullable', 'in:POST,GET,PUT,PATCH,DELETE'],
            'retry_count' => ['nullable', 'integer', 'min:0', 'max:10'],
            'timeout_seconds' => ['nullable', 'integer', 'min:1', 'max:60'],
            'events' => ['nullable', 'array', 'min:1'],
            'events.*' => ['string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $description = $data['description'] ?? $data['purpose'] ?? null;
        $events = isset($data['events']) ? array_values(array_filter($data['events'], fn ($event) => is_string($event) && trim($event) !== '')) : null;

        $webhookEndpoint->fill(array_filter([
            'name' => $data['name'] ?? null,
            'description' => $description,
            'target_url' => $data['target_url'] ?? null,
            'http_method' => $data['http_method'] ?? null,
            'retry_count' => $data['retry_count'] ?? null,
            'timeout_seconds' => $data['timeout_seconds'] ?? null,
            'events' => $events,
            'status' => $data['status'] ?? null,
        ], fn ($value) => $value !== null));

        $webhookEndpoint->save();

        $this->recordAudit($request, 'updated webhook endpoint', [
            'webhook_id' => $webhookEndpoint->id,
            'name' => $webhookEndpoint->name,
        ]);

        return response()->json(['data' => $webhookEndpoint]);
    }

    public function test(Request $request, WebhookEndpoint $webhookEndpoint): JsonResponse
    {
        if ($webhookEndpoint->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $payload = ['event' => 'webhook.test', 'data' => ['message' => 'Integration center webhook test'], 'sent_at' => now()->toIso8601String()];
        $secret = $webhookEndpoint->getSecretPlain();
        $signature = $secret ? hash_hmac('sha256', json_encode($payload), $secret) : null;

        try {
            $response = Http::timeout($webhookEndpoint->timeout_seconds ?? 10)
                ->withHeaders(array_filter([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Event' => 'webhook.test',
                    'X-Webhook-ID' => (string) $webhookEndpoint->id,
                    'X-Webhook-Timestamp' => now()->toIso8601String(),
                    'X-Webhook-Signature' => $signature ? 'sha256=' . $signature : null,
                ]))
                ->post($webhookEndpoint->target_url, $payload);

            $status = $response->status();
            $message = $response->successful() ? 'Webhook test delivered successfully.' : 'Webhook test completed with non-success response.';
        } catch (\Exception $e) {
            $status = 500;
            $message = 'Webhook test failed: ' . $e->getMessage();
        }

        $this->recordAudit($request, 'tested webhook endpoint', [
            'webhook_id' => $webhookEndpoint->id,
            'status_code' => $status,
        ]);

        return response()->json(['data' => ['message' => $message, 'status_code' => $status]]);
    }

    public function destroy(Request $request, WebhookEndpoint $webhookEndpoint): JsonResponse
    {
        if ($webhookEndpoint->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $webhookEndpoint->delete();

        $this->recordAudit($request, 'deleted webhook endpoint', [
            'webhook_id' => $webhookEndpoint->id,
            'name' => $webhookEndpoint->name,
        ]);

        return response()->json(['data' => ['message' => 'Webhook endpoint deleted']]);
    }
}
