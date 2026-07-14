<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $drivers = Driver::query()
            ->where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $drivers]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'vehicle_type' => ['required', 'string', 'max:128'],
            'vehicle_number' => ['nullable', 'string', 'max:128'],
            'license_number' => ['required', 'string', 'max:128'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive,away'],
        ]);

        $driver = Driver::create([
            'company_id' => $request->user()->company_id,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'vehicle_type' => $data['vehicle_type'],
            'vehicle_number' => $data['vehicle_number'] ?? null,
            'license_number' => $data['license_number'],
            'notes' => $data['notes'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]);

        $this->recordAudit($request, 'created driver', [
            'driver_id' => $driver->id,
            'name' => $driver->name,
        ]);

        return response()->json(['data' => $driver], 201);
    }

    public function destroy(Request $request, Driver $driver): JsonResponse
    {
        if ($driver->company_id !== $request->user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $driver->delete();

        $this->recordAudit($request, 'deleted driver', [
            'driver_id' => $driver->id,
            'name' => $driver->name,
        ]);

        return response()->json(['message' => 'Driver removed']);
    }
}
