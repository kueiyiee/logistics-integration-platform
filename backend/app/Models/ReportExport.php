<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportExport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'reference_number',
        'verification_id',
        'verification_token_hash',
        'document_version',
        'report_title',
        'report_category',
        'export_format',
        'generated_by',
        'generated_by_role',
        'company_id',
        'ip_address',
        'applied_filters',
        'record_count',
        'checksum',
        'expires_at',
    ];

    protected $hidden = [
        'verification_token_hash',
    ];

    protected $casts = [
        'applied_filters' => 'array',
        'expires_at' => 'datetime',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(ReportExportLog::class);
    }
}
