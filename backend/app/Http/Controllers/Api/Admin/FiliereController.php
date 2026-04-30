<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index(): JsonResponse
    {
        $filieres = Filiere::all();
        return response()->json(['data' => $filieres]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:filieres,name'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $filiere = Filiere::create($data);

        return response()->json(['data' => $filiere], 201);
    }

    public function destroy(Filiere $filiere): JsonResponse
    {
        $filiere->delete();
        return response()->json(null, 204);
    }
}
