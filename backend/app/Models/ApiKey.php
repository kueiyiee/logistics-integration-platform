<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'public_key',
        'key_prefix',
        'secret_hash',
        'environment',
        'permissions',
        'last_used_at',
        'expires_at',
        'status',
        'created_by',
        'revoked_at',
    ];

    protected $hidden = [
        'secret_hash',
    ];

    protected $casts = [
        'permissions' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public static function generateKeyPair(string $environment = 'production') : array
    {
        $prefixPublic = $environment === 'production' ? 'pk_live_' : 'pk_test_';
        $prefixSecret = $environment === 'production' ? 'sk_live_' : 'sk_test_';

        $public = $prefixPublic . strtoupper(Str::random(10));
        $secret = $prefixSecret . Str::random(40);

        return ['public' => $public, 'secret' => $secret, 'key_prefix' => $prefixPublic];
    }

    public function verifySecret(string $secret): bool
    {
        return Hash::check($secret, $this->secret_hash);
    }
}
