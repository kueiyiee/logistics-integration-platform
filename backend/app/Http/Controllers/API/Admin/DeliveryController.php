<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $deliveries = Delivery::query()
            ->where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $deliveries]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'tracking_number' => ['required', 'string', 'max:255'],
            'external_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $delivery = Delivery::create([
            'company_id' => $request->user()->company_id,
            'uuid' => Str::uuid()->toString(),
            'tracking_number' => $payload['tracking_number'],
            'external_reference' => $payload['external_reference'] ?? null,
            'status' => 'pending',
        ]);

        $this->recordAudit($request, 'created delivery', [
            'delivery_id' => $delivery->id,
            'tracking_number' => $delivery->tracking_number,
        ]);

        return response()->json($delivery, 201);
    }
}
