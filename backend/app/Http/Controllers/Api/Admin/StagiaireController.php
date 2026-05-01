<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\StagiaireResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $stagiaire->load(['profile', 'cv'])
            ->loadCount('applications');

        return response()->json([
            'data' => new StagiaireResource($stagiaire),
        ]);
    }

    public function destroy(User $stagiaire): JsonResponse
    {
        abort_unless($stagiaire->role === Role::Stagiaire, 404);

        if ($stagiaire->profile?->photo_path) {
            Storage::disk('public')->delete($stagiaire->profile->photo_path);
        }

        if ($stagiaire->cv?->pdf_path) {
            Storage::disk('local')->delete($stagiaire->cv->pdf_path);
        }

        $stagiaire->delete();

        return response()->json(null, 204);
    }

    public function downloadPdf(User $stagiaire)
    {
        abort_unless($stagiaire->role === Role::Stagiaire, 404);

        $cv = $stagiaire->cv;
        if (!$cv || !$cv->pdf_path || !Storage::disk('local')->exists($cv->pdf_path)) {
            abort(404, 'PDF not found');
        }

        return Storage::disk('local')->download(
            $cv->pdf_path, 
            'CV_' . str_replace(' ', '_', $stagiaire->full_name) . '.pdf'
        );
    }
}
