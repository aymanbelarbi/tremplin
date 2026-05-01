<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_stagiaire_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'full_name' => 'Ayman Belarbi',
            'email' => 'ayman@example.com',
            'phone' => '0612345678',
            'cin' => 'AB123456',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'full_name', 'email', 'role'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'ayman@example.com', 'role' => 'stagiaire']);
        $this->assertDatabaseHas('profiles', []);
    }

    public function test_registration_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['full_name', 'email', 'phone', 'cin', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'u@test.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'u@test.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'email', 'role'], 'token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@test.com',
            'password' => 'nope',
        ]);
        $response->assertStatus(422);
    }

    public function test_me_endpoint_requires_auth(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_me_returns_the_current_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_role_middleware_blocks_stagiaire_on_admin_routes(): void
    {
        \Illuminate\Support\Facades\Route::middleware(['auth:sanctum', 'role:admin'])
            ->get('/api/v1/admin/_dummy', fn () => response()->json(['ok' => true]));

        $user = User::factory()->create(['role' => Role::Stagiaire]);
        $this->actingAs($user)
            ->getJson('/api/v1/admin/_dummy')
            ->assertStatus(403);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
