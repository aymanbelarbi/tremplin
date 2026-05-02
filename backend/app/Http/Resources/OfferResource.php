<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'company_name' => $this->company_name,
            'type' => $this->type?->value ?? $this->type,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'location' => $this->location,
            'is_published' => (bool) $this->is_published,
            'published_at' => $this->published_at,
            'closes_at' => $this->closes_at?->format('Y-m-d'),
            'applications_count' => $this->applications_count ?? 0,
            'created_at' => $this->created_at,
        ];
    }
}
