<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    'verification' => [
        'expire' => (int) env('VERIFICATION_EXPIRE_MINUTES', 60),
    ],
    'lockout' => [
        'failed_attempts' => (int) env('LOCKOUT_FAILED_ATTEMPTS', 5),
        'lock_minutes' => (int) env('LOCKOUT_MINUTES', 15),
    ],
];
