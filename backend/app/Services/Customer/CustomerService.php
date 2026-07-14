<?php

namespace App\Services\Customer;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function list(array $filters): LengthAwarePaginator
    {
        return Customer::query()
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }
}
