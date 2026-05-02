<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Application::query()->with(['offer', 'user.profile', 'user.cv'])->latest();

        if ($offerId = $request->integer('offer_id')) {
            $q->where('offer_id', $offerId);
        }

        return response()->json(['data' => ApplicationResource::collection($q->get())]);
    }
}
