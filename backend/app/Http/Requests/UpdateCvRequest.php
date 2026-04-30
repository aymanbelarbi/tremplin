<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStagiaire() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:150'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'theme' => ['nullable', 'string', Rule::in(['classic', 'modern'])],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:20'],

            'experiences' => ['array'],
            'experiences.*.position' => ['required_with:experiences', 'string', 'max:150'],
            'experiences.*.company' => ['required_with:experiences', 'string', 'max:150'],
            'experiences.*.city' => ['nullable', 'string', 'max:100'],
            'experiences.*.start_date' => ['required_with:experiences', 'date'],
            'experiences.*.end_date' => ['nullable', 'date', 'after_or_equal:experiences.*.start_date'],
            'experiences.*.is_current' => ['boolean'],
            'experiences.*.description' => ['nullable', 'string', 'max:2000'],

            'educations' => ['array'],
            'educations.*.degree' => ['required_with:educations', 'string', 'max:150'],
            'educations.*.school' => ['required_with:educations', 'string', 'max:150'],
            'educations.*.city' => ['nullable', 'string', 'max:100'],
            'educations.*.start_date' => ['nullable', 'date'],
            'educations.*.end_date' => ['nullable', 'date'],
            'educations.*.description' => ['nullable', 'string', 'max:2000'],

            'skills' => ['array'],
            'skills.*.name' => ['required_with:skills', 'string', 'max:100'],

            'languages' => ['array'],
            'languages.*.name' => ['required_with:languages', 'string', 'max:100'],
            'languages.*.level' => ['nullable', Rule::in(['Débutant', 'Moyen', 'Bien', 'Excellent', 'Maternel'])],

            'certifications' => ['array'],
            'certifications.*.name' => ['required_with:certifications', 'string', 'max:150'],
            'certifications.*.year' => ['nullable', 'integer', 'min:2000', 'max:2030'],

            'links' => ['array'],
            'links.*.label' => ['nullable', 'string', 'max:150'],
            'links.*.url' => ['nullable', 'string', 'max:255'],
        ];
    }
}
