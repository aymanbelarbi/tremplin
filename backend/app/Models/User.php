<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function setFirstNameAttribute($value): void
    {
        $this->attributes['first_name'] = $value ? mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8') : $value;
    }

    public function setLastNameAttribute($value): void
    {
        $this->attributes['last_name'] = $value ? mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8') : $value;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isStagiaire(): bool
    {
        return $this->role === Role::Stagiaire;
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function cv(): HasOne
    {
        return $this->hasOne(Cv::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
