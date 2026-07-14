<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Lang;

class QueuedVerifyEmail extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(protected ?string $token = null)
    {
    }

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        $appName = config('app.name', 'Delivery Portal');
        $logoUrl = config('app.logo_url', null);

        $message = (new MailMessage)
            ->subject("[{$appName}] Verify Your Email Address")
            ->greeting("Hello {$notifiable->name},")
            ->line("Welcome to {$appName}! Please verify your email address to continue.")
            ->action('Verify Email Address', $verificationUrl)
            ->line('If the button above does not work, copy and paste the following URL into your browser:')
            ->line($verificationUrl)
            ->line('For your security this link will expire in '.config('auth.verification.expire', 60).' minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Regards, '. $appName . ' Security Team');

        if ($logoUrl) {
            $message->with('logo', $logoUrl);
        }

        return $message;
    }

    protected function verificationUrl($notifiable)
    {
        $expiry = now()->addMinutes(config('auth.verification.expire', 1440));
        $token = $this->token ?? $notifiable->beginEmailVerification();

        return URL::temporarySignedRoute(
            'api.v1.auth.verify-email',
            $expiry,
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification()), 'token' => $token]
        );
    }
}
