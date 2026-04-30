<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CvSkill extends Model
{
    protected $fillable = ['cv_id', 'name', 'sort_order'];

    public function cv(): BelongsTo
    {
        return $this->belongsTo(Cv::class);
    }
}
