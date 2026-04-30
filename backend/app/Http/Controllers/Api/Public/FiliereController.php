<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\JsonResponse;

class FiliereController extends Controller
{
    public function index(): JsonResponse
    {
        $filieres = Filiere::all();
        return response()->json(['data' => $filieres]);
    }
}
