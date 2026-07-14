<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $drivers = Driver::with('company')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $drivers]);
    }
}
