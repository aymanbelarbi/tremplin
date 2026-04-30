<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfferRequest;
use App\Http\Resources\OfferResource;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Offer::query()->withCount('applications')->latest();

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'like', "%{$search}%")->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => OfferResource::collection($q->get())]);
    }

    public function store(StoreOfferRequest $request): JsonResponse
    {
        $data = $request->validated();
        $offer = Offer::create([
            ...$data,
            'is_published' => $data['is_published'] ?? true,
            'published_at' => ($data['is_published'] ?? true) ? now() : null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => new OfferResource($offer)], 201);
    }

    public function show(Offer $offer): JsonResponse
    {
        $offer->loadCount('applications');
        return response()->json(['data' => new OfferResource($offer)]);
    }

    public function update(StoreOfferRequest $request, Offer $offer): JsonResponse
    {
        $data = $request->validated();
        $wasPublished = (bool) $offer->getOriginal('is_published');
        $offer->fill($data);
        $isNowPublished = (bool) $offer->is_published;
        if ($isNowPublished && (! $wasPublished || ! $offer->published_at)) {
            $offer->published_at = now();
        } elseif (! $isNowPublished) {
            $offer->published_at = null;
        }
        $offer->save();
        return response()->json(['data' => new OfferResource($offer->fresh())]);
    }

    public function destroy(Offer $offer): JsonResponse
    {
        $offer->delete();
        return response()->json(['ok' => true]);
    }
}
