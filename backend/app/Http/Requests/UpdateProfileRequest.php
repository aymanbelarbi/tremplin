<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStagiaire() ?? false;
    }

    public function rules(): array
    {
        return [
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . ($this->user()?->id ?? 'NULL')],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'employment_status' => ['sometimes', 'in:looking,employed'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:150'],
            'job_company' => ['sometimes', 'nullable', 'string', 'max:150'],
            'job_city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'job_start_date' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'birth_date' => ['sometimes', 'nullable', 'date', 'before:today'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'filiere' => ['sometimes', 'nullable', 'string', 'max:120'],
            'promotion' => ['sometimes', 'nullable', 'integer', 'digits:4', 'min:2000'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],

            'loisirs' => ['sometimes', 'nullable', 'array'],
            'loisirs.*.label' => ['sometimes', 'string', 'max:50'],
            'loisirs.*.url' => ['sometimes', 'string', 'max:255', 'url'],
        ];
    }
}
