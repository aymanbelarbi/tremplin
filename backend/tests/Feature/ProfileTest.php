<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_stagiaire_reads_empty_profile_on_first_call(): void
    {
        $user = User::factory()->create(['role' => Role::Stagiaire]);

        $this->actingAs($user)
            ->getJson('/api/v1/me/profile')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonStructure(['profile' => ['user_id', 'employment_status']]);
    }

    public function test_stagiaire_updates_profile(): void
    {
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        Profile::create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'first_name' => 'Sara', 'last_name' => 'K.',
                'city' => 'Khemisset',
                'promotion' => 2024, 'bio' => 'Test bio',
                'filiere' => 'Développement informatique',
                'niveau' => 'Technicien spécialisé',
                'has_diploma' => true,
            ])
            ->assertOk()
            ->assertJsonPath('user.full_name', 'Sara K.')
            ->assertJsonPath('profile.city', 'Khemisset');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'filiere' => 'Développement informatique',
        ]);
    }

    public function test_admin_cannot_use_stagiaire_profile_route(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->getJson('/api/v1/me/profile')->assertStatus(403);
    }
}
