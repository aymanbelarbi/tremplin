<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'cover_message' => $this->cover_message,
            'applied_at' => $this->created_at,
            'offer' => $this->whenLoaded('offer', fn () => [
                'id' => $this->offer->id,
                'title' => $this->offer->title,
                'company_name' => $this->offer->company_name,

                'location' => $this->offer->location,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'email' => $this->user->email,
                'filiere' => $this->user->profile?->filiere,
            ]),
        ];
    }
}
