<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Offer::query()
            ->where('is_published', true)
            ->withCount('applications')
            ->latest('published_at');

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }
        if ($type = $request->string('type')->toString()) {
            $q->where('type', $type);
        }
        if ($city = $request->string('city')->toString()) {
            $q->where('location', 'like', "%{$city}%");
        }
        if ($filiere = $request->string('filiere')->toString()) {
            $q->where('requirements', 'like', "%{$filiere}%");
        }

        return response()->json([
            'data' => OfferResource::collection($q->get()),
        ]);
    }

    public function show(Offer $offer): JsonResponse
    {
        abort_unless($offer->is_published, 404);
        $offer->loadCount('applications');

        return response()->json([
            'data' => new OfferResource($offer),
        ]);
    }
}
