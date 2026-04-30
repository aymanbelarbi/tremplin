<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalStagiaires = User::where('role', Role::Stagiaire)->count();
        $totalOffers = Offer::where('is_published', true)->count();
        $totalApplications = Application::count();

        // Employment stats
        $employed = User::where('role', Role::Stagiaire)
            ->whereHas('profile', fn ($q) => $q->where('employment_status', 'employed'))
            ->count();
        $looking = $totalStagiaires - $employed;

        // Employment by filiere
        $employmentByFiliere = User::where('role', Role::Stagiaire)
            ->with('profile')
            ->get()
            ->groupBy(fn ($u) => $u->profile?->filiere ?? 'Autre')
            ->map(fn ($group, $filiere) => [
                'filiere' => (string) $filiere,
                'total' => $group->count(),
                'employed' => $group->filter(fn ($u) => $u->profile?->employment_status === 'employed' || $u->profile?->employment_status?->value === 'employed')->count(),
                'looking' => $group->filter(fn ($u) => $u->profile?->employment_status !== 'employed' && $u->profile?->employment_status?->value !== 'employed')->count(),
            ])
            ->sortByDesc('total')
            ->take(8)
            ->values();

        $since = Carbon::now()->subDays(30)->startOfDay();
        $totalsByDay = Application::selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', $since)
            ->groupBy('day')
            ->pluck('total', 'day');

        $applicationsByDay = collect(range(0, 29))
            ->map(fn ($i) => Carbon::now()->subDays(29 - $i)->toDateString())
            ->map(fn ($day) => [
                'day' => Carbon::parse($day)->format('d/m'),
                'candidatures' => (int) ($totalsByDay[$day] ?? 0),
            ])
            ->values();

        $recent = Application::with('offer', 'user.profile')->latest()->limit(6)->get()->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->user?->full_name,
            'role' => 'Stagiaire · '.($a->user?->profile?->filiere ?? '—'),
            'action' => 'a postulé à '.($a->offer?->title ?? 'une offre'),
            'when' => $a->created_at?->diffForHumans(),
            'status' => 'pending', // Default dot for UI
        ]);

        return response()->json([
            'kpis' => [
                'stagiaires' => $totalStagiaires,
                'employed' => $employed,
                'looking' => $looking,
                'offers' => $totalOffers,
                'applications' => $totalApplications,
            ],
            'employment_by_filiere' => $employmentByFiliere,
            'applications_30d' => $applicationsByDay,
            'recent' => $recent,
        ]);
    }
}
