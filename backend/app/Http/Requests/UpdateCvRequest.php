<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStagiaire() ?? false;
    }

    public function rules(): array
    {
        return [
            'summary' => ['nullable', 'string', 'max:2000'],
            'is_finalized' => ['boolean'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:20'],

            'experiences' => ['nullable', 'array'],
            'educations' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
            'languages' => ['nullable', 'array'],
            'certifications' => ['nullable', 'array'],
            'loisirs' => ['nullable', 'array'],
        ];
    }
}
