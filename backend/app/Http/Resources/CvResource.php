<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CvResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'summary' => $this->summary,
            'experiences' => $this->experiences ?? [],
            'educations' => $this->educations ?? [],
            'skills' => $this->skills ?? [],
            'languages' => $this->languages ?? [],
            'certifications' => $this->certifications ?? [],
            'loisirs' => $this->loisirs ?? [],
            'is_finalized' => (bool) $this->is_finalized,
            'updated_at' => $this->updated_at,
        ];
    }
}
