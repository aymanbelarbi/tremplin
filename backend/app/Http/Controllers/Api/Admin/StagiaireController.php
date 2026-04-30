<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\StagiaireResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StagiaireController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = User::query()
            ->where('role', Role::Stagiaire)
            ->with('profile')
            ->withCount('applications')
            ->latest();

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])->orWhere('email', 'like', "%{$search}%");
            });
        }
        if ($status = $request->string('employment_status')->toString()) {
            $q->whereHas('profile', fn ($p) => $p->where('employment_status', $status));
        }
        if ($filiere = $request->string('filiere')->toString()) {
            $q->whereHas('profile', fn ($p) => $p->where('filiere', $filiere));
        }
        if ($promotion = $request->string('promotion')->toString()) {
            $q->whereHas('profile', fn ($p) => $p->where('promotion', $promotion));
        }

        return response()->json(['data' => StagiaireResource::collection($q->get())]);
    }

    public function show(User $stagiaire): JsonResponse
    {
        abort_unless($stagiaire->role === Role::Stagiaire, 404);
        $stagiaire->load(['profile', 'cv.experiences', 'cv.educations', 'cv.skills', 'cv.languages'])
            ->loadCount('applications');

        return response()->json([
            'data' => new StagiaireResource($stagiaire),
        ]);
    }

}
