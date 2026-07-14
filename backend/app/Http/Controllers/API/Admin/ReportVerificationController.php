<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportExportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportVerificationController extends Controller
{
    protected ReportExportService $service;

    public function __construct(ReportExportService $service)
    {
        $this->service = $service;
    }

    public function verify(Request $request, string $token): JsonResponse
    {
        $export = $this->service->verifyToken($token);

        if (! $export) {
            return response()->json([
                'status' => 'invalid',
                'message' => 'Report verification failed or report has expired.',
            ], 404);
        }

        $this->service->markAsVerified(
            $export,
            optional($request->user())->id,
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'status' => 'valid',
            'report_id' => $export->report_id,
            'reference_number' => $export->reference_number,
            'generated_at' => $export->created_at?->toDateTimeString(),
            'generated_by' => $export->generated_by,
            'generated_by_role' => $export->generated_by_role,
            'company_id' => $export->company_id,
            'report_category' => $export->report_category,
            'document_type' => $export->export_format,
            'verification_timestamp' => now()->toDateTimeString(),
        ]);
    }
}
