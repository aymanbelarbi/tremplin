<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_fetch_stats(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/stats')
            ->assertOk()
            ->assertJsonStructure([
                'kpis' => ['stagiaires', 'offers', 'applications', 'acceptance_rate'],
                'applications_30d',
                'status_mix',
                'offers_by_filiere',
                'recent',
            ]);
    }
}
