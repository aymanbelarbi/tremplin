<?php

namespace App\Http\Controllers\Api\Stagiaire;


use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $apps = $request->user()->applications()->with('offer')->latest()->get();
        return response()->json(['data' => ApplicationResource::collection($apps)]);
    }

    public function store(StoreApplicationRequest $request, Offer $offer): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (! $profile || ! $profile->profile_completed) {
            throw ValidationException::withMessages([
                'profile' => ['Votre profil doit être complété pour postuler.'],
            ]);
        }

        $cv = $user->cv;
        if (! $cv || ! $cv->is_finalized) {
            throw ValidationException::withMessages([
                'cv' => ['Votre CV doit être finalisé pour postuler.'],
            ]);
        }

        abort_unless($offer->is_published, 404);

        if ($offer->closes_at && $offer->closes_at->endOfDay()->isPast()) {
            throw ValidationException::withMessages([
                'offer' => ['Cette offre a dépassé sa date de clôture.'],
            ]);
        }

        if ($user->applications()->where('offer_id', $offer->id)->exists()) {
            throw ValidationException::withMessages([
                'offer' => ['Vous avez déjà postulé à cette offre.'],
            ]);
        }

        $app = Application::create([
            'user_id' => $user->id,
            'offer_id' => $offer->id,
        ]);

        $app->load('offer');

        return response()->json(['data' => new ApplicationResource($app)], 201);
    }

    public function destroy(Request $request, Application $application): JsonResponse
    {
        if ($application->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $application->delete();

        return response()->json(null, 204);
    }
}
