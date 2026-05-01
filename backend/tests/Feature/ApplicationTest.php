<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Cv;
use App\Models\Offer;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function makeOffer(): Offer
    {
        $admin = User::factory()->admin()->create();
        return Offer::create([
            'title' => 'Stage', 'company_name' => 'Acme', 'type' => 'stage',
            'description' => 'x', 'is_published' => true, 'published_at' => now(),
            'created_by' => $admin->id,
        ]);
    }

    public function test_stagiaire_with_completed_profile_and_cv_can_apply(): void
    {
        Mail::fake();
        $offer = $this->makeOffer();
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        Profile::create([
            'user_id' => $user->id,
            'profile_completed' => true,
            'filiere' => 'Dev',
            'city' => 'Khemisset',
        ]);
        Cv::create(['user_id' => $user->id, 'is_finalized' => true]);

        $this->actingAs($user)
            ->postJson('/api/v1/offers/'.$offer->id.'/apply')
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('applications', ['offer_id' => $offer->id]);
    }

    public function test_stagiaire_without_completed_profile_is_blocked(): void
    {
        $offer = $this->makeOffer();
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        Profile::create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->postJson('/api/v1/offers/'.$offer->id.'/apply')
            ->assertStatus(422);
    }

    public function test_stagiaire_without_finalized_cv_is_blocked(): void
    {
        $offer = $this->makeOffer();
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        Profile::create([
            'user_id' => $user->id,
            'profile_completed' => true,
            'filiere' => 'Dev',
            'city' => 'Khemisset',
        ]);
        Cv::create(['user_id' => $user->id, 'is_finalized' => false]);

        $this->actingAs($user)
            ->postJson('/api/v1/offers/'.$offer->id.'/apply')
            ->assertStatus(422);
    }

    public function test_admin_can_decide_application_and_mail_is_sent(): void
    {
        Mail::fake();
        $offer = $this->makeOffer();
        $user = User::factory()->create(['role' => Role::Stagiaire]);
        Profile::create([
            'user_id' => $user->id,
            'profile_completed' => true,
            'filiere' => 'Dev',
            'city' => 'Khemisset',
        ]);
        Cv::create(['user_id' => $user->id, 'is_finalized' => true]);

        $this->actingAs($user)
            ->postJson('/api/v1/offers/'.$offer->id.'/apply')
            ->assertCreated();

        $appId = \App\Models\Application::first()->id;

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)
            ->putJson('/api/v1/admin/applications/'.$appId.'/decision', [
                'status' => 'accepted',
                'decision_note' => 'Profil retenu.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        Mail::assertSent(\App\Mail\ApplicationStatusMail::class);
    }
}
