<?php

namespace App\Models;

use App\Enums\EmploymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StagiaireProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employment_status',
        'job_title',
        'job_company',
        'job_city',
        'job_start_date',
        'birth_date',

        'city',
        'photo_path',
        'filiere',
        'promotion',
        'bio',

        'links',
        'profile_completed',
    ];

    protected function casts(): array
    {
        return [
            'profile_completed' => 'boolean',
            'birth_date' => 'date',
            'employment_status' => EmploymentStatus::class,
            'job_start_date' => 'date',

            'links' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
