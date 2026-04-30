<?php

namespace App\Http\Controllers\Api\Stagiaire;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCvRequest;
use App\Http\Resources\CvResource;
use App\Models\Cv;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CvController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cv = $this->getOrCreate($request->user());
        return response()->json(['data' => new CvResource($cv->load('experiences', 'educations', 'skills', 'languages', 'certifications'))]);
    }

    public function update(UpdateCvRequest $request): JsonResponse
    {
        $user = $request->user();
        $cv = $this->getOrCreate($user);
        $data = $request->validated();

        DB::transaction(function () use ($cv, $data, $user) {
            $cv->fill(collect($data)->only(['title', 'summary', 'links'])->toArray());
            $cv->save();

            if (array_key_exists('summary', $data)) {
                $profile = \App\Models\StagiaireProfile::firstOrCreate(['user_id' => $user->id]);
                $profile->bio = $data['summary'];
                $profile->save();
            }

            if (isset($data['first_name'])) {
                $user->first_name = $data['first_name'];
            }
            if (isset($data['last_name'])) {
                $user->last_name = $data['last_name'];
            }
            if (isset($data['phone'])) {
                $user->phone = $data['phone'];
            }
            if ($user->isDirty(['first_name', 'last_name', 'phone'])) {
                $user->save();
            }

            if (isset($data['birth_date'])) {
                $profile = \App\Models\StagiaireProfile::firstOrCreate(['user_id' => $user->id]);
                $profile->birth_date = $data['birth_date'];
                $profile->save();
            }

            if (array_key_exists('experiences', $data)) {
                $cv->experiences()->delete();
                foreach ($data['experiences'] as $i => $exp) {
                    $cv->experiences()->create([...$exp, 'sort_order' => $i]);
                }
            }
            if (array_key_exists('educations', $data)) {
                $cv->educations()->delete();
                foreach ($data['educations'] as $i => $ed) {
                    $cv->educations()->create([...$ed, 'sort_order' => $i]);
                }
            }
            if (array_key_exists('skills', $data)) {
                $cv->skills()->delete();
                foreach ($data['skills'] as $i => $sk) {
                    $cv->skills()->create([...$sk, 'sort_order' => $i]);
                }
            }
            if (array_key_exists('languages', $data)) {
                $cv->languages()->delete();
                foreach ($data['languages'] as $lang) {
                    $lang = array_filter($lang, fn ($v) => $v !== null);
                    $cv->languages()->create($lang);
                }
            }
            if (array_key_exists('certifications', $data)) {
                $cv->certifications()->delete();
                foreach ($data['certifications'] as $i => $cert) {
                    $cert = array_filter($cert, fn ($v) => $v !== null);
                    $cv->certifications()->create([...$cert, 'sort_order' => $i]);
                }
            }
        });

        return response()->json([
            'data' => new CvResource($cv->fresh()->load('experiences', 'educations', 'skills', 'languages', 'certifications')),
        ]);
    }

    protected function getOrCreate($user): Cv
    {
        return Cv::firstOrCreate(
            ['user_id' => $user->id],
            ['title' => 'CV · '.$user->full_name],
        );
    }
}
