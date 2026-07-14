<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookEndpointLog extends Model
{
    use HasFactory;

    protected $fillable = ['webhook_endpoint_id','event','payload','attempts','response_code','response_body','status','delivered_at'];

    protected $casts = [
        'delivered_at' => 'datetime',
    ];
}
