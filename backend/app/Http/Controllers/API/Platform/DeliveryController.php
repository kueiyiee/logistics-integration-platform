<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $deliveries = Delivery::with('company')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $deliveries]);
    }
}
