<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request, CustomerService $service): JsonResponse
    {
        $customers = $service->list($request->query());

        return response()->json(['data' => CustomerResource::collection($customers)]);
    }

    public function store(CustomerRequest $request, CustomerService $service): JsonResponse
    {
        $customer = $service->create($request->validated());

        return response()->json(new CustomerResource($customer), 201);
    }
}
