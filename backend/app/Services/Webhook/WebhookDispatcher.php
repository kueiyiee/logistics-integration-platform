<?php

namespace App\Services\Webhook;

use App\Jobs\DeliverWebhookJob;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Facades\Log;

class WebhookDispatcher
{
    public function dispatchForCompany(string $event, int $companyId, array $payload = []): void
    {
        $endpoints = WebhookEndpoint::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->get();

        foreach ($endpoints as $endpoint) {
            $events = $endpoint->events ?? [];
            if (! in_array($event, $events, true)) continue;

            try {
                DeliverWebhookJob::dispatch($endpoint, $event, $payload)->onQueue('webhooks');
            } catch (\Exception $e) {
                Log::warning('Failed to dispatch webhook job', ['endpoint' => $endpoint->id, 'error' => $e->getMessage()]);
            }
        }
    }
}
