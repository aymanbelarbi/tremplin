<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\RegistrationConfirmedMail;
use App\Models\StagiaireProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => Role::Stagiaire,
            ]);
            StagiaireProfile::create([
                'user_id' => $user->id,
                'employment_status' => $data['employment_status'] ?? 'looking',
                'job_title' => $data['job_title'] ?? null,
                'job_company' => $data['job_company'] ?? null,
                'job_city' => $data['job_city'] ?? null,
                'job_start_date' => $data['job_start_date'] ?? null,
                'filiere' => $data['filiere'] ?? null,
                'promotion' => $data['promotion'] ?? null,
            ]);
            return $user;
        });

        $token = $user->createToken('auth')->plainTextToken;

        try {
            Mail::to($user->email)->send(new RegistrationConfirmedMail($user));
        } catch (\Throwable $e) {
            Log::warning('Registration email failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }
}
