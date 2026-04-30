<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'company_name',

        'description',
        'requirements',
        'location',
        'contract_type',
        'duration',
        'salary_range',
        'is_published',
        'published_at',
        'closes_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [

            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'closes_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
