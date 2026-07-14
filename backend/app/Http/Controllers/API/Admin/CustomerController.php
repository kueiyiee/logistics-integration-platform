<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $customers]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $customer = Customer::create([
            'company_id' => $request->user()->company_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);

        $this->recordAudit($request, 'created customer', [
            'customer_id' => $customer->id,
            'email' => $customer->email,
        ]);

        return response()->json($customer, 201);
    }
}
