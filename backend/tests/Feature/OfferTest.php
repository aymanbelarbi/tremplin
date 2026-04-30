<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfferTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_offers_index_lists_only_published(): void
    {
        $admin = User::factory()->admin()->create();
        Offer::create([
            'title' => 'Stage React', 'company_name' => 'Acme', 'type' => 'stage',
            'description' => 'x', 'is_published' => true, 'published_at' => now(),
            'created_by' => $admin->id,
        ]);
        Offer::create([
            'title' => 'Brouillon', 'company_name' => 'Acme', 'type' => 'stage',
            'description' => 'x', 'is_published' => false, 'created_by' => $admin->id,
        ]);

        $this->getJson('/api/v1/offers')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Stage React')
            ->assertJsonCount(1, 'data');
    }

    public function test_public_offer_show_returns_detail(): void
    {
        $admin = User::factory()->admin()->create();
        $offer = Offer::create([
            'title' => 'Stage', 'company_name' => 'Acme', 'type' => 'stage',
            'description' => 'desc', 'is_published' => true, 'published_at' => now(),
            'created_by' => $admin->id,
        ]);

        $this->getJson('/api/v1/offers/'.$offer->id)
            ->assertOk()
            ->assertJsonPath('data.id', $offer->id);
    }

    public function test_admin_can_create_offer(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/offers', [
                'title' => 'Nouveau stage',
                'company_name' => 'Nexa',
                'type' => 'stage',
                'description' => 'Mission dev fullstack.',
                'location' => 'Casablanca',
                'is_published' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Nouveau stage');

        $this->assertDatabaseHas('offers', ['title' => 'Nouveau stage']);
    }

    public function test_stagiaire_cannot_create_offer(): void
    {
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        $this->actingAs($user)
            ->postJson('/api/v1/admin/offers', [
                'title' => 't', 'company_name' => 'c', 'type' => 'stage', 'description' => 'd',
            ])
            ->assertStatus(403);
    }
}
