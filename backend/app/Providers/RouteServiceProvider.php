<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/';

    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function (): void {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            $identifier = optional($request->user())->id ?: $request->ip();
            return Limit::perMinute(60)->by($identifier);
        });

        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email');
            $key = 'login|'.$email.'|'.$request->ip();

            return Limit::perMinute(10)->by($key);
        });
    }
}
