<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'uuid',
        'tracking_number',
        'external_reference',
        'status',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
