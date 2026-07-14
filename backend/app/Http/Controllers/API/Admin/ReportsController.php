<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\LoginHistory;
use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Services\ReportExportService;
use Dompdf\Dompdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Csv as SpreadsheetCsvWriter;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as SpreadsheetXlsxWriter;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Writer\Word2007;
use Picqer\Barcode\BarcodeGeneratorPNG;

class ReportsController extends Controller
{
    private const REPORTS = [
        ['id' => 1, 'title' => 'Companies', 'category' => 'companies', 'description' => 'Tenant company profile and status data.'],
        ['id' => 2, 'title' => 'Company Managers', 'category' => 'company_managers', 'description' => 'Managers assigned to tenant companies.'],
        ['id' => 3, 'title' => 'Company Dispatchers', 'category' => 'company_dispatchers', 'description' => 'Dispatch team members and operational contacts.'],
        ['id' => 4, 'title' => 'Users', 'category' => 'users', 'description' => 'Active platform users and account status.'],
        ['id' => 5, 'title' => 'Drivers', 'category' => 'drivers', 'description' => 'Driver records and vehicle assignments.'],
        ['id' => 6, 'title' => 'Deliveries', 'category' => 'deliveries', 'description' => 'Shipment deliveries and workflow status.'],
        ['id' => 7, 'title' => 'Customers', 'category' => 'customers', 'description' => 'Customer directory and contact details.'],
        ['id' => 8, 'title' => 'API Keys', 'category' => 'api_keys', 'description' => 'Integration credentials and lifecycle status.'],
        ['id' => 9, 'title' => 'Webhooks', 'category' => 'webhooks', 'description' => 'Configured webhook endpoints and delivery settings.'],
        ['id' => 10, 'title' => 'Login History', 'category' => 'login_history', 'description' => 'Authentication events and login activity.'],
        ['id' => 11, 'title' => 'Audit Logs', 'category' => 'audit_logs', 'description' => 'Security audit events and metadata details.'],
    ];

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $search = trim((string) $request->query('search', ''));

        $reports = collect(self::REPORTS)
            ->map(fn (array $report) => array_merge($report, [
                'total_records' => $this->countReport($report['category'], $companyId),
                'created_at' => now()->toDateTimeString(),
                'status' => 'Ready',
            ]));

        if ($search !== '') {
            $reports = $reports->filter(function (array $report) use ($search) {
                return str_contains(strtolower($report['title']), strtolower($search))
                    || str_contains(strtolower($report['category']), strtolower($search))
                    || str_contains(strtolower($report['description']), strtolower($search));
            });
        }

        return response()->json(['data' => $reports->values()]);
    }

    private ReportExportService $exportService;

    public function __construct(ReportExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    public function export(Request $request, int $reportId)
    {
        $format = strtolower((string) $request->query('format', 'xlsx'));
        $report = $this->findReport($reportId);

        if (! $report) {
            abort(404, 'Report not found');
        }

        if (! in_array($format, ['pdf', 'xlsx', 'csv', 'docx'], true)) {
            abort(400, 'Report format not supported');
        }

        $rows = $this->generateReportRows($reportId, $request);
        $filename = Str::slug($report['category'] . '-' . $report['title'], '-') . '.' . $format;

        $filters = $request->query('filters', []);
        if (is_string($filters)) {
            $filters = json_decode($filters, true) ?: ['raw' => $filters];
        }

        $generatedByRole = $request->user()?->roles()->pluck('name')->first() ?? 'System';

        $exportRecord = $this->exportService->createExportRecord([
            'report_title' => $report['title'],
            'report_category' => $report['category'],
            'export_format' => $format,
            'generated_by' => $request->user()?->id,
            'generated_by_role' => $generatedByRole,
            'company_id' => $request->user()?->company_id,
            'ip_address' => $request->ip(),
            'user_id' => $request->user()?->id,
            'user_agent' => $request->userAgent(),
            'applied_filters' => $filters,
            'record_count' => count($rows),
            'expires_at' => now()->addDays(30),
        ]);

        $responseHeaders = [
            'X-Report-Verification-Url' => $exportRecord['verificationUrl'],
            'X-Report-Reference-Number' => $exportRecord['export']->reference_number,
            'X-Report-Document-Version' => $exportRecord['export']->document_version,
            'X-Report-Checksum' => $exportRecord['export']->checksum,
        ];

        return match ($format) {
            'csv' => $this->downloadCsv($filename, $rows, $report, $exportRecord['verificationUrl'])->withHeaders($responseHeaders),
            'xlsx' => $this->downloadXlsx($filename, $rows, $report, $exportRecord['verificationUrl'])->withHeaders($responseHeaders),
            'docx' => $this->downloadDocx($filename, $rows, $report, $exportRecord['verificationUrl'])->withHeaders($responseHeaders),
            'pdf' => $this->downloadPdf($filename, $report, $rows, $exportRecord['verificationUrl'])->withHeaders($responseHeaders),
        };
    }

    private function findReport(int $reportId): ?array
    {
        return collect(self::REPORTS)->first(fn (array $report) => $report['id'] === $reportId);
    }

    private function countReport(string $category, ?int $companyId): int
    {
        return match ($category) {
            'companies' => $companyId ? Company::where('id', $companyId)->count() : Company::count(),
            'company_managers' => User::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->whereHas('roles', fn ($query) => $query->where('name', 'Company Manager'))
                ->count(),
            'company_dispatchers' => User::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->whereHas('roles', fn ($query) => $query->where('name', 'Company Dispatcher'))
                ->count(),
            'users' => User::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'drivers' => Driver::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'deliveries' => Delivery::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'customers' => Customer::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'api_keys' => ApiKey::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'webhooks' => WebhookEndpoint::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'login_history' => LoginHistory::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            'audit_logs' => AuditLog::when($companyId, fn ($query) => $query->where('company_id', $companyId))->count(),
            default => 0,
        };
    }

    private function generateReportRows(int $reportId, Request $request): array
    {
        $companyId = $request->user()->company_id;

        return match ($reportId) {
            1 => Company::when($companyId, fn ($query) => $query->where('id', $companyId))
                ->get(['id', 'name', 'slug', 'status', 'created_at', 'updated_at'])
                ->map(fn ($company) => $company->toArray())
                ->toArray(),
            2 => User::with('roles')
                ->when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->whereHas('roles', fn ($query) => $query->where('name', 'Company Manager'))
                ->get(['id', 'name', 'email', 'company_id', 'status', 'created_at'])
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'company_id' => $user->company_id,
                    'roles' => $user->roles->pluck('name')->join(', '),
                    'status' => $user->status,
                    'created_at' => $user->created_at,
                ])
                ->toArray(),
            3 => User::with('roles')
                ->when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->whereHas('roles', fn ($query) => $query->where('name', 'Company Dispatcher'))
                ->get(['id', 'name', 'email', 'company_id', 'status', 'created_at'])
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'company_id' => $user->company_id,
                    'roles' => $user->roles->pluck('name')->join(', '),
                    'status' => $user->status,
                    'created_at' => $user->created_at,
                ])
                ->toArray(),
            4 => User::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'name', 'email', 'company_id', 'status', 'created_at'])
                ->map(fn ($user) => $user->toArray())
                ->toArray(),
            5 => Driver::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'name', 'email', 'phone', 'vehicle_type', 'vehicle_number', 'license_number', 'status', 'created_at'])
                ->map(fn ($driver) => $driver->toArray())
                ->toArray(),
            6 => Delivery::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'uuid', 'tracking_number', 'external_reference', 'status', 'created_at'])
                ->map(fn ($delivery) => $delivery->toArray())
                ->toArray(),
            7 => Customer::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'name', 'email', 'phone', 'created_at'])
                ->map(fn ($customer) => $customer->toArray())
                ->toArray(),
            8 => ApiKey::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'name', 'public_key', 'key_prefix', 'environment', 'status', 'expires_at', 'created_at'])
                ->map(fn ($apiKey) => $apiKey->toArray())
                ->toArray(),
            9 => WebhookEndpoint::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'name', 'target_url', 'http_method', 'status', 'retry_count', 'timeout_seconds', 'events', 'created_at'])
                ->map(fn ($endpoint) => array_merge($endpoint->toArray(), ['events' => $endpoint->events ?? []]))
                ->toArray(),
            10 => LoginHistory::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'user_id', 'success', 'reason', 'ip_address', 'browser', 'os', 'device', 'occurred_at'])
                ->map(fn ($history) => $history->toArray())
                ->toArray(),
            11 => AuditLog::when($companyId, fn ($query) => $query->where('company_id', $companyId))
                ->get(['id', 'user_id', 'action', 'metadata', 'created_at'])
                ->map(fn ($audit) => $audit->toArray())
                ->toArray(),
            default => [],
        };
    }

    private function downloadCsv(string $filename, array $rows, array $report, string $verificationUrl)
    {
        $stream = fopen('php://memory', 'w+');

        if (! empty($rows)) {
            $headers = array_keys($rows[0]);
            fputcsv($stream, $headers);
            foreach ($rows as $row) {
                fputcsv($stream, array_map(fn ($value) => $this->normalizeValue($value), $row));
            }
        }

        fputcsv($stream, []);
        fputcsv($stream, ['Report Title', $report['title']]);
        fputcsv($stream, ['Report Category', $report['category']]);
        fputcsv($stream, ['Generated At', now()->toDateTimeString()]);
        fputcsv($stream, ['Verification Url', $verificationUrl]);

        rewind($stream);
        $content = stream_get_contents($stream);
        fclose($stream);

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function downloadXlsx(string $filename, array $rows, array $report, string $verificationUrl)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if (! empty($rows)) {
            $sheet->fromArray(array_keys($rows[0]), null, 'A1');
            $sheet->fromArray(array_map(fn ($row) => array_values($row), $rows), null, 'A2');
            $metadataRow = count($rows) + 3;
        } else {
            $sheet->setCellValue('A1', 'No data available');
            $metadataRow = 3;
        }

        $sheet->setCellValue('A' . $metadataRow, 'Report Title');
        $sheet->setCellValue('B' . $metadataRow, $report['title']);
        $sheet->setCellValue('A' . ($metadataRow + 1), 'Report Category');
        $sheet->setCellValue('B' . ($metadataRow + 1), $report['category']);
        $sheet->setCellValue('A' . ($metadataRow + 2), 'Exported At');
        $sheet->setCellValue('B' . ($metadataRow + 2), now()->toDateTimeString());
        $sheet->setCellValue('A' . ($metadataRow + 3), 'Verification Url');
        $sheet->setCellValue('B' . ($metadataRow + 3), $verificationUrl);

        foreach (range('A', 'E') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new SpreadsheetXlsxWriter($spreadsheet);

        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function downloadDocx(string $filename, array $rows, array $report, string $verificationUrl)
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $section->addText($report['title'], ['bold' => true, 'size' => 16]);
        $section->addText($report['description'] ?? '', ['size' => 11, 'color' => '555555']);
        $section->addTextBreak(1);

        if (! empty($rows)) {
            $table = $section->addTable(['borderSize' => 6, 'borderColor' => '999999', 'cellMargin' => 80]);
            $table->addRow();
            foreach (array_keys($rows[0]) as $header) {
                $table->addCell(2000)->addText((string) $header, ['bold' => true]);
            }
            foreach ($rows as $row) {
                $table->addRow();
                foreach (array_values($row) as $value) {
                    $table->addCell(2000)->addText($this->normalizeValue($value));
                }
            }
        } else {
            $section->addText('No data available.');
        }

        $section->addTextBreak(1);
        $section->addText('Verification Url:', ['bold' => true]);
        $section->addText($verificationUrl, ['size' => 10, 'color' => '0000FF']);
        $section->addText('Exported at ' . now()->toDateTimeString(), ['size' => 9, 'color' => '777777']);

        $qrDataUri = $this->buildQrCodeDataUri($verificationUrl);
        $barcodeDataUri = $this->buildBarcodeDataUri('REF-' . strtoupper(Str::random(6)));

        $qrPath = $this->storeTempImage($qrDataUri);
        $barcodePath = $this->storeTempImage($barcodeDataUri);

        $section->addTextBreak(1);
        $section->addImage($qrPath, ['width' => 120, 'height' => 120]);
        $section->addTextBreak(1);
        $section->addImage($barcodePath, ['width' => 260, 'height' => 70]);

        $writer = new Word2007($phpWord);
        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        @unlink($qrPath);
        @unlink($barcodePath);

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function downloadPdf(string $filename, array $report, array $rows, string $verificationUrl)
    {
        $qrDataUri = $this->buildQrCodeDataUri($verificationUrl);
        $barcodeDataUri = $this->buildBarcodeDataUri($report['title'] . ' ' . $report['category']);

        $html = '<html><head><style>';
        $html .= 'body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#202124;margin:0;padding:0;}';
        $html .= '.page-header{padding:16px 24px;border-bottom:1px solid #e1e4e8;background:#f8f9fa;}';
        $html .= '.report-title{font-size:20px;margin:0;color:#111827;}';
        $html .= '.report-subtitle{margin:6px 0 0;color:#475569;font-size:12px;}';
        $html .= '.meta-grid{display:flex;justify-content:space-between;gap:16px;margin-top:14px;font-size:11px;color:#374151;}';
        $html .= '.meta-grid div{min-width:180px;}';
        $html .= '.watermark{position:fixed;top:30%;left:0;width:100%;text-align:center;opacity:0.08;font-size:96px;color:#101828;transform:rotate(-30deg);pointer-events:none;z-index:-1;}';
        $html .= 'table{border-collapse:collapse;width:100%;margin:20px 0;font-size:10px;}';
        $html .= 'th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top;}';
        $html .= 'th{background:#f3f4f6;color:#111827;font-weight:700;}';
        $html .= '.footer{position:fixed;bottom:10px;left:24px;right:24px;font-size:10px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px;display:flex;justify-content:space-between;}';
        $html .= '.footer .left{max-width:70%;}';
        $html .= '.verification-link{color:#1d4ed8;text-decoration:none;}';
        $html .= '.qr-code{position:absolute;top:18px;right:24px;width:120px;border:1px solid #d1d5db;padding:8px;background:#fff;}';
        $html .= '.barcode{margin-top:12px;width:260px;}';
        $html .= '</style></head><body>';
        $html .= '<div class="watermark">ENTERPRISE REPORT</div>';
        $html .= '<div class="page-header">';
        $html .= '<div><h1 class="report-title">' . htmlspecialchars($report['title'], ENT_QUOTES, 'UTF-8') . '</h1>';
        $html .= '<p class="report-subtitle">' . htmlspecialchars($report['description'] ?? '', ENT_QUOTES, 'UTF-8') . '</p>';
        $html .= '<div class="meta-grid">';
        $html .= '<div><strong>Category:</strong> ' . htmlspecialchars($report['category'], ENT_QUOTES, 'UTF-8') . '</div>';
        $html .= '<div><strong>Exported At:</strong> ' . now()->toDateTimeString() . '</div>';
        $html .= '<div><strong>Verification:</strong> <a class="verification-link" href="' . htmlspecialchars($verificationUrl, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($verificationUrl, ENT_QUOTES, 'UTF-8') . '</a></div>';
        $html .= '</div></div>';
        $html .= '<div class="qr-code"><img src="' . $qrDataUri . '" width="120" height="120"/><div class="barcode"><img src="' . $barcodeDataUri . '" width="260"/></div></div>';
        $html .= '</div>';

        if (! empty($rows)) {
            $headers = array_keys($rows[0]);
            $html .= '<table><thead><tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . htmlspecialchars((string) $header, ENT_QUOTES, 'UTF-8') . '</th>';
            }
            $html .= '</tr></thead><tbody>';

            foreach ($rows as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . htmlspecialchars($this->normalizeValue($cell), ENT_QUOTES, 'UTF-8') . '</td>';
                }
                $html .= '</tr>';
            }

            $html .= '</tbody></table>';
        } else {
            $html .= '<p style="padding:24px 0;">No data available.</p>';
        }

        $html .= '<div class="footer"><div class="left">Generated by Delivery Portal Enterprise Export Service</div><div class="right">Verification URL: <a class="verification-link" href="' . htmlspecialchars($verificationUrl, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($verificationUrl, ENT_QUOTES, 'UTF-8') . '</a></div></div>';
        $html .= '</body></html>';

        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function normalizeValue(mixed $value): string
    {
        if (is_array($value) || is_object($value)) {
            return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return (string) $value;
    }

    private function buildQrCodeDataUri(string $payload): string
    {
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($payload)
            ->size(150)
            ->margin(10)
            ->build();

        return $result->getDataUri();
    }

    private function buildBarcodeDataUri(string $payload): string
    {
        $generator = new BarcodeGeneratorPNG();
        $barcode = $generator->getBarcode($payload, BarcodeGeneratorPNG::TYPE_CODE_128, 2, 70);

        return 'data:image/png;base64,' . base64_encode($barcode);
    }

    private function storeTempImage(string $dataUri): string
    {
        [$meta, $image] = explode(',', $dataUri, 2);
        $path = tempnam(sys_get_temp_dir(), 'report_export_') . '.png';
        file_put_contents($path, base64_decode($image));

        return $path;
    }
}
