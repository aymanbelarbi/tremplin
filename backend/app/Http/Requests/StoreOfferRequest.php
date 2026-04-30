<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $isUpdate = $this->route('offer') !== null;
        $closesAtRules = ['nullable', 'date'];
        if (! $isUpdate) {
            $closesAtRules[] = 'after_or_equal:today';
        }

        return [
            'title' => ['required', 'string', 'max:180'],
            'company_name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['emploi', 'stage'])],
            'description' => ['required', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:3000'],
            'location' => ['nullable', 'string', 'max:150'],
            'contract_type' => ['nullable', 'string', 'max:80'],
            'duration' => ['nullable', 'string', 'max:80'],
            'salary_range' => ['nullable', 'string', 'max:80'],
            'is_published' => ['boolean'],
            'closes_at' => $closesAtRules,
        ];
    }
}
