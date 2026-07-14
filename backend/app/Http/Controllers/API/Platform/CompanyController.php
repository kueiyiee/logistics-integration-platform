<?php

namespace App\Http\Controllers\API\Platform;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class CompanyController extends Controller
{
    public function index(): JsonResponse
    {
        $companies = Company::orderBy('created_at', 'desc')->get()->map(function (Company $company) {
            $company->setAttribute('metadata', $company->metadata ?? []);
            return $company;
        });

        return response()->json(['data' => $companies]);
    }

    public function pending(): JsonResponse
    {
        $companies = Company::where('status', 'pending')->orderBy('created_at', 'asc')->get();

        return response()->json(['data' => $companies]);
    }

    public function show(Company $company): JsonResponse
    {
        $company->setAttribute('metadata', $company->metadata ?? []);

        return response()->json(['data' => $company]);
    }

    public function approve(Request $request, Company $company): JsonResponse
    {
        $this->authorize('approve', $company);

        if ($company->slug === 'system-admin') abort(403, 'Cannot modify system company');

        $company->status = 'active';
        $company->metadata = array_merge($company->metadata ?? [], [
            'last_reviewed_at' => now()->toISOString(),
            'approved_by' => $request->user()->id,
            'approved_at' => now()->toISOString(),
        ]);
        $company->save();

        return response()->json(['message' => 'Company approved', 'company' => $company]);
    }

    public function reject(Request $request, Company $company): JsonResponse
    {
        $this->authorize('reject', $company);

        if ($company->slug === 'system-admin') abort(403, 'Cannot modify system company');

        $company->status = 'rejected';
        $company->metadata = array_merge($company->metadata ?? [], [
            'rejected_by' => $request->user()->id,
            'rejected_at' => now()->toISOString(),
        ]);
        $company->save();

        return response()->json(['message' => 'Company rejected', 'company' => $company]);
    }

    public function suspend(Request $request, Company $company): JsonResponse
    {
        if ($company->slug === 'system-admin') abort(403, 'Cannot modify system company');

        $company->status = 'suspended';
        $company->save();

        return response()->json(['message' => 'Company suspended', 'company' => $company]);
    }

    public function activate(Request $request, Company $company): JsonResponse
    {
        if ($company->slug === 'system-admin') abort(403, 'Cannot modify system company');

        $company->status = 'active';
        $company->save();

        return response()->json(['message' => 'Company activated', 'company' => $company]);
    }

    public function destroy(Request $request, Company $company): JsonResponse
    {
        if ($company->slug === 'system-admin') abort(403, 'Cannot delete system company');

        $company->delete();

        return response()->json(['message' => 'Company deleted']);
    }
}
