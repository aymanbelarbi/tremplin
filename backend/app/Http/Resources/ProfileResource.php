<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'user_id' => $this->user_id,
            'employment_status' => $this->employment_status?->value ?? $this->employment_status,
            'job_title' => $this->job_title,
            'job_company' => $this->job_company,
            'job_city' => $this->job_city,
            'job_start_date' => $this->job_start_date?->format('Y-m-d'),
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'city' => $this->city,
            'photo_path' => $this->photo_path ? Storage::url($this->photo_path) : null,
            'filiere' => $this->filiere,
            'promotion' => $this->promotion,
            'bio' => $this->bio,
            'loisirs' => $this->loisirs,
            'profile_completed' => (bool) $this->profile_completed,
        ];
    }
}
