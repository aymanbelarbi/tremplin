<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin_email');
        $password = config('app.admin_password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Administration',
                'last_name' => 'Tremplin',
                'phone' => null,
                'role' => Role::Admin,
                'password' => Hash::make($password),
            ]
        );
    }
}
