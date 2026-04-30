<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StagiaireResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'created_at' => $this->created_at,
            'profile' => $this->whenLoaded('profile', fn () => new StagiaireProfileResource($this->profile)),
            'cv' => $this->whenLoaded('cv', fn () => new CvResource($this->cv)),
            'applications_count' => $this->whenCounted('applications'),
        ];
    }
}
