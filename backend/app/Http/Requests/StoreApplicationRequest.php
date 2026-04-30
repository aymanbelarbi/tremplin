<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStagiaire() ?? false;
    }

    public function rules(): array
    {
        return [
            'cover_message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
