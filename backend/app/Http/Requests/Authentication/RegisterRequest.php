<?php

namespace App\Http\Requests\Authentication;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $slug = Str::slug($value);

                    if (Company::where('slug', $slug)->exists()) {
                        $fail('That company name is already in use. Please choose a different name or add a suffix like "Acme Logistics".');
                    }
                },
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', function ($attribute, $value, $fail) {
                $normalizedEmail = User::normalizeEmail($value);

                if (User::where('email', $normalizedEmail)->exists()) {
                    $fail('That email address is already registered. Please use a different email or sign in if you already have an account.');
                }
            }],
            'password' => ['required', 'string', 'confirmed', Password::min(12)->mixedCase()->letters()->numbers()->symbols()->uncompromised()],
            'password_confirmation' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'That email address is already registered. Please use a different email or sign in if you already have an account.',
            'password.confirmed' => 'Passwords must match.',
            'company_name.required' => 'Company name is required.',
        ];
    }
}
