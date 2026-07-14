<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\DeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request, DeliveryService $service): JsonResponse
    {
        $deliveries = $service->list($request->query());

        return response()->json(['data' => DeliveryResource::collection($deliveries)]);
    }

    public function store(DeliveryRequest $request, DeliveryService $service): JsonResponse
    {
        $delivery = $service->create($request->validated());

        return response()->json(new DeliveryResource($delivery), 201);
    }
}
