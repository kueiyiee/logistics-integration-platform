<?php

namespace App\Services\Delivery;

use App\Models\Delivery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use App\Services\Webhook\WebhookDispatcher;

class DeliveryService
{
    public function list(array $filters): LengthAwarePaginator
    {
        return Delivery::query()
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Delivery
    {
        $delivery = Delivery::create([
            'company_id' => $data['company_id'] ?? 1,
            'uuid' => $data['uuid'] ?? Str::uuid()->toString(),
            'tracking_number' => $data['tracking_number'],
            'external_reference' => $data['external_reference'] ?? null,
            'status' => 'pending',
        ]);

        // dispatch webhooks for delivery.created
        try {
            $dispatcher = new WebhookDispatcher();
            $dispatcher->dispatchForCompany('delivery.created', $delivery->company_id, ['delivery' => $delivery->toArray()]);
        } catch (\Exception $e) {
            // log but do not fail creation
            \Illuminate\Support\Facades\Log::warning('Failed to dispatch delivery.created webhooks', ['error' => $e->getMessage()]);
        }

        return $delivery;
    }
}
