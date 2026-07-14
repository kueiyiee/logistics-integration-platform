<?php

namespace App\Http\Requests\Delivery;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tracking_number' => ['required', 'string', 'max:120'],
            'external_reference' => ['nullable', 'string', 'max:120'],
            'pickup_address' => ['required', 'array'],
            'dropoff_address' => ['required', 'array'],
        ];
    }
}
