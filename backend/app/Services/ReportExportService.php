<?php

namespace App\Services;

use App\Models\ReportExport;
use App\Models\ReportExportLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ReportExportService
{
    public function createExportRecord(array $data): array
    {
        $timestamp = now();
        $reportId = $this->generateReportId($timestamp);
        $referenceNumber = $this->generateReferenceNumber($timestamp);
        $verificationId = Str::upper(Str::random(16));
        $verificationToken = $this->generateVerificationToken();
        $verificationHash = hash('sha256', $verificationToken);

        $payload = [
            'report_id' => $reportId,
            'reference_number' => $referenceNumber,
            'verification_id' => $verificationId,
            'verification_token_hash' => $verificationHash,
            'document_version' => $data['document_version'] ?? '1.0',
            'report_title' => $data['report_title'],
            'report_category' => $data['report_category'],
            'export_format' => strtoupper($data['export_format']),
            'generated_by' => $data['generated_by'] ?? null,
            'generated_by_role' => $data['generated_by_role'] ?? null,
            'company_id' => $data['company_id'] ?? null,
            'ip_address' => $data['ip_address'] ?? null,
            'applied_filters' => $data['applied_filters'] ?? [],
            'record_count' => $data['record_count'] ?? 0,
            'expires_at' => $data['expires_at'] ?? null,
        ];

        $payload['checksum'] = $this->calculateChecksum($payload);

        $export = ReportExport::create($payload);

        $this->createLog(
            $export->id,
            'generated',
            $data['user_id'] ?? $data['generated_by'] ?? null,
            $data['ip_address'] ?? null,
            $data['user_agent'] ?? null,
            [
                'verification_url' => $this->makeVerificationUrl($verificationToken),
                'reference_number' => $referenceNumber,
                'report_id' => $reportId,
            ]
        );

        return [
            'export' => $export,
            'verificationToken' => $verificationToken,
            'verificationUrl' => $this->makeVerificationUrl($verificationToken),
        ];
    }

    public function verifyToken(string $token): ?ReportExport
    {
        $tokenHash = hash('sha256', $token);

        return ReportExport::where('verification_token_hash', $tokenHash)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    protected function makeVerificationUrl(string $token): string
    {
        return url('/api/v1/reports/verify/' . $token);
    }

    public function generateVerificationToken(): string
    {
        return hash('sha256', Str::random(64) . Str::uuid()->toString());
    }

    public function generateReportId(\DateTimeInterface $timestamp, string $prefix = 'RPT'): string
    {
        return sprintf('%s-%s-%06d', $prefix, $timestamp->format('Ymd'), random_int(1, 999999));
    }

    public function generateReferenceNumber(\DateTimeInterface $timestamp): string
    {
        return sprintf('REF-%s-%s', $timestamp->format('YmdHis'), strtoupper(Str::random(6)));
    }

    protected function calculateChecksum(array $payload): string
    {
        $metadata = $payload;
        unset($metadata['checksum']);
        ksort($metadata);

        return hash('sha256', json_encode($metadata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    public function markAsVerified(ReportExport $export, ?int $userId, ?string $ipAddress, ?string $userAgent = null): void
    {
        $this->createLog(
            $export->id,
            'verified',
            $userId,
            $ipAddress,
            $userAgent,
            [
                'verification_time' => now()->toDateTimeString(),
                'report_id' => $export->report_id,
                'reference_number' => $export->reference_number,
            ]
        );
    }

    protected function createLog(int $exportId, string $action, ?int $userId, ?string $ipAddress, ?string $userAgent, array $metadata): void
    {
        ReportExportLog::create([
            'report_export_id' => $exportId,
            'action' => $action,
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'metadata' => $metadata,
        ]);
    }
}
