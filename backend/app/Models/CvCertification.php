<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CvCertification extends Model
{
    protected $table = 'cv_certifications';

    protected $fillable = [
        'cv_id',
        'name',
        'year',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    public function cv()
    {
        return $this->belongsTo(Cv::class);
    }
}
