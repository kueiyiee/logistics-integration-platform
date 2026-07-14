<?php

namespace App\Repositories\Eloquent;

use App\Models\Company;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CompanyRepository implements CompanyRepositoryInterface
{
    public function create(array $data): Company
    {
        return Company::create($data);
    }

    public function findById(int $id): ?Company
    {
        return Company::find($id);
    }

    public function findByUuid(string $uuid): ?Company
    {
        return Company::where('uuid', $uuid)->first();
    }

    public function list(array $filters): LengthAwarePaginator
    {
        return Company::query()
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }
}
