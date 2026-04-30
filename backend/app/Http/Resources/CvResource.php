<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CvResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'is_finalized' => (bool) $this->is_finalized,
            'links' => $this->links ?? [],
            'experiences' => $this->experiences->map(fn ($e) => [
                'id' => $e->id,
                'position' => $e->position,
                'company' => $e->company,
                'city' => $e->city,
                'start_date' => $e->start_date,
                'end_date' => $e->end_date,
                'is_current' => (bool) $e->is_current,
                'description' => $e->description,
                'sort_order' => $e->sort_order,
            ]),
            'educations' => $this->educations->map(fn ($e) => [
                'id' => $e->id,
                'degree' => $e->degree,
                'school' => $e->school,
                'city' => $e->city,
                'start_date' => $e->start_date,
                'end_date' => $e->end_date,
                'description' => $e->description,
                'sort_order' => $e->sort_order,
            ]),
            'skills' => $this->skills->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,

                'sort_order' => $s->sort_order,
            ]),
            'languages' => $this->languages->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'level' => $l->level,
            ]),
            'certifications' => $this->certifications->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'year' => $c->year,
                'sort_order' => $c->sort_order,
            ]),
            'updated_at' => $this->updated_at,
        ];
    }
}
