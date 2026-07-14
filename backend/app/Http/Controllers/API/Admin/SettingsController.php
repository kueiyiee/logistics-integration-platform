<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        if (! $companyId) {
            return response()->json(['message' => 'Your account is not associated with a company.'], 403);
        }

        $company = Company::find($companyId);
        if (! $company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        return response()->json(['data' => $company]);
    }

    public function update(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        if (! $companyId) {
            return response()->json(['message' => 'Your account is not associated with a company.'], 403);
        }

        $company = Company::find($companyId);
        if (! $company) {
            return response()->json(['message' => 'Company not found.'], 404);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ]);

        $company->update($data);

        $this->recordAudit($request, 'updated settings', [
            'company_id' => $company->id,
            'changes' => $data,
        ]);

        return response()->json(['data' => $company]);
    }
}
