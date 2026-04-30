<?php

namespace App\Http\Controllers\Api\Stagiaire;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\StagiaireProfileResource;
use App\Http\Resources\UserResource;
use App\Models\StagiaireProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = StagiaireProfile::firstOrCreate(['user_id' => $user->id]);

        return response()->json([
            'user' => new UserResource($user),
            'profile' => new StagiaireProfileResource($profile),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['first_name'])) {
            $user->first_name = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $user->last_name = $data['last_name'];
        }
        if (array_key_exists('phone', $data)) {
            $user->phone = $data['phone'];
        }
        $user->save();

        $profile = StagiaireProfile::firstOrCreate(['user_id' => $user->id]);
        $profile->fill(collect($data)->only([
            'employment_status', 'job_title', 'job_company', 'job_city', 'job_start_date',
            'birth_date', 'address', 'city', 'filiere', 'promotion', 'bio',
            'links',
        ])->toArray());
        // Track progress marker
        $profile->profile_completed = (bool) ($profile->filiere && $profile->city);
        $profile->save();

        if (array_key_exists('bio', $data)) {
            $cv = \App\Models\Cv::firstOrCreate(
                ['user_id' => $user->id],
                ['title' => 'CV · ' . $user->full_name]
            );
            $cv->summary = $data['bio'];
            $cv->save();
        }

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'profile' => new StagiaireProfileResource($profile->fresh()),
        ]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = $request->user();
        $profile = StagiaireProfile::firstOrCreate(['user_id' => $user->id]);

        // Delete old photo
        if ($profile->photo_path) {
            Storage::disk('public')->delete($profile->photo_path);
        }

        $path = $request->file('photo')->store('photos', 'public');
        $profile->photo_path = $path;
        $profile->save();

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'profile' => new StagiaireProfileResource($profile->fresh()),
        ]);
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = StagiaireProfile::firstOrCreate(['user_id' => $user->id]);

        if ($profile->photo_path) {
            Storage::disk('public')->delete($profile->photo_path);
            $profile->photo_path = null;
            $profile->save();
        }

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'profile' => new StagiaireProfileResource($profile->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Mot de passe mis à jour.',
        ]);
    }
}
