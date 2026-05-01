<?php

namespace App\Http\Controllers\Api\Stagiaire;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCvRequest;
use App\Http\Resources\CvResource;
use App\Models\Cv;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CvController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cv = $this->getOrCreate($request->user());
        return response()->json(['data' => new CvResource($cv)]);
    }

    public function update(UpdateCvRequest $request): JsonResponse
    {
        $user = $request->user();
        $cv = $this->getOrCreate($user);
        $data = $request->validated();

        DB::transaction(function () use ($cv, $data, $user) {
            $cv->fill(collect($data)->only([
                'summary', 'experiences', 'educations', 'skills',
                'languages', 'certifications', 'loisirs', 'is_finalized',
            ])->toArray());
            $cv->save();

            if (array_key_exists('summary', $data)) {
                $profile = \App\Models\Profile::firstOrCreate(['user_id' => $user->id]);
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
                $profile = \App\Models\Profile::firstOrCreate(['user_id' => $user->id]);
                $profile->birth_date = $data['birth_date'];
                $profile->save();
            }
        });

        return response()->json([
            'data' => new CvResource($cv->fresh()),
        ]);
    }

    protected function getOrCreate($user): Cv
    {
        return Cv::firstOrCreate(
            ['user_id' => $user->id],
        );
    }

    public function uploadPdf(Request $request): JsonResponse
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        $user = $request->user();
        $cv = $this->getOrCreate($user);

        if ($cv->pdf_path) {
            Storage::disk('local')->delete($cv->pdf_path);
        }

        $path = $request->file('pdf')->store('cv_pdfs', 'local');
        $cv->pdf_path = $path;
        $cv->save();

        return response()->json([
            'message' => 'PDF uploaded successfully',
            'path' => $path,
        ]);
    }
}
