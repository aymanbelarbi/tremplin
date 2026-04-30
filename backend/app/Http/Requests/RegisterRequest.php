<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:100'],
            'last_name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:180', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'employment_status' => ['sometimes', 'in:looking,employed'],
            'job_title' => ['required_if:employment_status,employed', 'nullable', 'string', 'max:150'],
            'job_company' => ['required_if:employment_status,employed', 'nullable', 'string', 'max:150'],
            'job_city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'job_start_date' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'filiere' => ['sometimes', 'nullable', 'string', 'max:120'],
            'promotion' => ['sometimes', 'nullable', 'integer', 'digits:4', 'min:2000'],
        ];
    }
}
