<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cv extends Model
{
    use HasFactory;

    protected $table = 'cvs';

    protected $fillable = [
        'user_id',
        'summary',
        'experiences',
        'educations',
        'skills',
        'languages',
        'certifications',
        'loisirs',
        'pdf_path',
        'is_finalized',
    ];

    protected function casts(): array
    {
        return [
            'is_finalized' => 'boolean',
            'experiences' => 'array',
            'educations' => 'array',
            'skills' => 'array',
            'languages' => 'array',
            'certifications' => 'array',
            'loisirs' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
