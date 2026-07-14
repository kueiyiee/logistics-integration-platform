<?php

use App\Http\Controllers\API\Admin\ApiKeyController;
use App\Http\Controllers\API\Admin\AuditLogController;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\DriverController;
use App\Http\Controllers\API\Admin\PermissionController;
use App\Http\Controllers\API\Admin\ReportVerificationController;
use App\Http\Controllers\API\Admin\ReportsController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\SettingsController;
use App\Http\Controllers\API\Admin\UserRoleController;
use App\Http\Controllers\API\Admin\WebhookEndpointController;
use App\Http\Controllers\API\Authentication\AuthController;
use App\Http\Controllers\API\Authentication\PasswordResetController;
use App\Http\Controllers\API\Authentication\RegisterController;
use App\Http\Controllers\API\Authentication\EmailVerificationController;
use App\Http\Controllers\API\Client\CustomerController;
use App\Http\Controllers\API\Client\DeliveryController;
use App\Http\Controllers\Api\HealthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', [HealthController::class, 'index']);

    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/register', [RegisterController::class, 'register'])->middleware('throttle:6,1');
    Route::get('/auth/verify-email', [EmailVerificationController::class, 'verify'])->name('api.v1.auth.verify-email');
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'reset']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/mfa/setup', [\App\Http\Controllers\API\Authentication\MfaController::class, 'setup']);
        Route::post('/auth/mfa/confirm', [\App\Http\Controllers\API\Authentication\MfaController::class, 'confirm']);
        Route::post('/auth/mfa/verify', [\App\Http\Controllers\API\Authentication\MfaController::class, 'verify']);
        Route::post('/auth/mfa/recovery-codes', [\App\Http\Controllers\API\Authentication\MfaController::class, 'generateRecoveryCodesEndpoint']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        Route::get('/reports/verify/{token}', [ReportVerificationController::class, 'verify']);

        Route::prefix('admin')->middleware(['audit.log','protect.system'])->group(function (): void {
            Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:admin.access');
            Route::get('/security', [DashboardController::class, 'security'])->middleware('permission:admin.access');

            Route::get('/api-keys', [ApiKeyController::class, 'index'])->middleware('permission:manage.api_keys');
            Route::post('/api-keys', [ApiKeyController::class, 'store'])->middleware('permission:manage.api_keys');
            Route::post('/api-keys/{apiKey}/regenerate', [ApiKeyController::class, 'regenerate'])->middleware('permission:manage.api_keys');
            Route::delete('/api-keys/{apiKey}', [ApiKeyController::class, 'destroy'])->middleware('permission:manage.api_keys');

            Route::get('/webhooks', [WebhookEndpointController::class, 'index'])->middleware('permission:manage.webhooks');
            Route::post('/webhooks', [WebhookEndpointController::class, 'store'])->middleware('permission:manage.webhooks');
            Route::patch('/webhooks/{webhookEndpoint}', [WebhookEndpointController::class, 'update'])->middleware('permission:manage.webhooks');
            Route::post('/webhooks/{webhookEndpoint}/test', [WebhookEndpointController::class, 'test'])->middleware('permission:manage.webhooks');
            Route::delete('/webhooks/{webhookEndpoint}', [WebhookEndpointController::class, 'destroy'])->middleware('permission:manage.webhooks');

            Route::get('/reports', [ReportsController::class, 'index'])->middleware('permission:view.audit_logs');
            Route::get('/reports/{reportId}/export', [ReportsController::class, 'export'])->middleware('permission:view.audit_logs');

            Route::get('/drivers', [DriverController::class, 'index'])->middleware('permission:manage.drivers');
            Route::post('/drivers', [DriverController::class, 'store'])->middleware('permission:manage.drivers');
            Route::delete('/drivers/{driver}', [DriverController::class, 'destroy'])->middleware('permission:manage.drivers');

            Route::get('/deliveries', [App\Http\Controllers\API\Admin\DeliveryController::class, 'index'])->middleware('permission:manage.deliveries');
            Route::post('/deliveries', [App\Http\Controllers\API\Admin\DeliveryController::class, 'store'])->middleware('permission:manage.deliveries');

            Route::get('/customers', [App\Http\Controllers\API\Admin\CustomerController::class, 'index'])->middleware('permission:manage.customers');
            Route::post('/customers', [App\Http\Controllers\API\Admin\CustomerController::class, 'store'])->middleware('permission:manage.customers');

            Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:view.audit_logs');
            Route::get('/settings', [SettingsController::class, 'show'])->middleware('permission:manage.settings');
            Route::put('/settings', [SettingsController::class, 'update'])->middleware('permission:manage.settings');

            Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:admin.access');
            Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:admin.access');
            Route::get('/users', [UserRoleController::class, 'index'])->middleware('permission:manage.settings');
            Route::post('/users', [
                App\Http\Controllers\API\Admin\AdminUserController::class,
                'store'
            ])->middleware('permission:manage.settings');
            Route::get('/pending-accounts', [\App\Http\Controllers\API\Admin\UserApprovalController::class, 'index'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/approve', [\App\Http\Controllers\API\Admin\UserApprovalController::class, 'approve'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/reject', [\App\Http\Controllers\API\Admin\UserApprovalController::class, 'reject'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/resend-verification', [\App\Http\Controllers\API\Admin\UserApprovalController::class, 'resendVerification'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/roles', [UserRoleController::class, 'store'])->middleware('permission:manage.settings');
            Route::delete('/users/{user}/roles/{role}', [UserRoleController::class, 'destroy'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/suspend', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'suspend'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/activate', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'activate'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/lock', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'lock'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/unlock', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'unlock'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/disable', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'disable'])->middleware('permission:manage.settings');
            Route::delete('/users/{user}', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'destroy'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/reset-password', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'resetPassword'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/force-reset-password', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'forceResetPassword'])->middleware('permission:manage.settings');
            Route::post('/users/{user}/terminate-sessions', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'terminateSessions'])->middleware('permission:manage.settings');
            Route::get('/users/{user}/sessions', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'sessions'])->middleware('permission:manage.settings');
            Route::delete('/sessions/{id}', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'revokeSession'])->middleware('permission:manage.settings');
            Route::get('/users/{user}/login-history', [\App\Http\Controllers\API\Admin\AdminUserController::class, 'loginHistory'])->middleware('permission:manage.settings');
        });

        Route::prefix('client')->middleware('permission:client.access')->group(function (): void {
            Route::get('/deliveries', [DeliveryController::class, 'index']);
            Route::post('/deliveries', [DeliveryController::class, 'store']);

            Route::get('/customers', [CustomerController::class, 'index']);
            Route::post('/customers', [CustomerController::class, 'store']);
        });

        Route::prefix('platform')->middleware(['permission:manage.system', 'audit.log', 'protect.system', 'enterprise.access'])->group(function (): void {
            Route::get('/dashboard', [\App\Http\Controllers\API\Platform\DashboardController::class, 'index'])->middleware('role.hierarchy:system');
            Route::get('/companies', [\App\Http\Controllers\API\Platform\CompanyController::class, 'index'])->middleware('role.hierarchy:system');
            Route::get('/companies/pending', [\App\Http\Controllers\API\Platform\CompanyController::class, 'pending'])->middleware('role.hierarchy:system');
            Route::get('/companies/{company}', [\App\Http\Controllers\API\Platform\CompanyController::class, 'show'])->middleware('role.hierarchy:system');
            Route::post('/companies/{company}/approve', [\App\Http\Controllers\API\Platform\CompanyController::class, 'approve'])->middleware('role.hierarchy:system');
            Route::post('/companies/{company}/reject', [\App\Http\Controllers\API\Platform\CompanyController::class, 'reject'])->middleware('role.hierarchy:system');
            Route::post('/companies/{company}/suspend', [\App\Http\Controllers\API\Platform\CompanyController::class, 'suspend'])->middleware('role.hierarchy:system');
            Route::post('/companies/{company}/activate', [\App\Http\Controllers\API\Platform\CompanyController::class, 'activate'])->middleware('role.hierarchy:system');
            Route::delete('/companies/{company}', [\App\Http\Controllers\API\Platform\CompanyController::class, 'destroy'])->middleware('role.hierarchy:system');

            Route::get('/users', [\App\Http\Controllers\API\Platform\UserController::class, 'index']);
            Route::post('/users/{user}/roles', [\App\Http\Controllers\API\Platform\UserController::class, 'storeRole']);
            Route::delete('/users/{user}/roles/{role}', [\App\Http\Controllers\API\Platform\UserController::class, 'destroyRole']);

            Route::get('/roles', [\App\Http\Controllers\API\Platform\RoleController::class, 'index']);
            Route::get('/permissions', [\App\Http\Controllers\API\Platform\PermissionController::class, 'index']);
            Route::get('/deliveries', [\App\Http\Controllers\API\Platform\DeliveryController::class, 'index']);
            Route::get('/drivers', [\App\Http\Controllers\API\Platform\DriverController::class, 'index']);
        });

        Route::get('/auth/me', [AuthController::class, 'me']);
    });
});
