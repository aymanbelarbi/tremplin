<?php

use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\OfferController as AdminOfferController;
use App\Http\Controllers\Api\Admin\StagiaireController as AdminStagiaireController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Public\OfferController as PublicOfferController;
use App\Http\Controllers\Api\Public\FiliereController as PublicFiliereController;
use App\Http\Controllers\Api\Admin\FiliereController as AdminFiliereController;
use App\Http\Controllers\Api\Stagiaire\ApplicationController as StagiaireApplicationController;
use App\Http\Controllers\Api\Stagiaire\CvController;
use App\Http\Controllers\Api\Stagiaire\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public auth
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    // Public offers
    Route::get('offers', [PublicOfferController::class, 'index']);
    Route::get('offers/{offer}', [PublicOfferController::class, 'show']);

    // Public filieres
    Route::get('filieres', [PublicFiliereController::class, 'index']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Stagiaire
        Route::middleware('role:stagiaire')->group(function () {
            Route::get('me/profile', [ProfileController::class, 'show']);
            Route::put('me/profile', [ProfileController::class, 'update']);
            Route::post('me/profile/photo', [ProfileController::class, 'uploadPhoto']);
            Route::delete('me/profile/photo', [ProfileController::class, 'deletePhoto']);
            Route::put('me/password', [ProfileController::class, 'changePassword']);

            Route::get('me/cv', [CvController::class, 'show']);
            Route::put('me/cv', [CvController::class, 'update']);
            Route::post('me/cv/pdf', [CvController::class, 'uploadPdf']);

            Route::get('me/applications', [StagiaireApplicationController::class, 'index']);
            Route::delete('me/applications/{application}', [StagiaireApplicationController::class, 'destroy']);
            Route::post('offers/{offer}/apply', [StagiaireApplicationController::class, 'store']);
        });

        // Admin
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('stats', [StatsController::class, 'index']);

            Route::apiResource('offers', AdminOfferController::class);

            Route::get('stagiaires', [AdminStagiaireController::class, 'index']);
            Route::get('stagiaires/{stagiaire}', [AdminStagiaireController::class, 'show']);
            Route::delete('stagiaires/{stagiaire}', [AdminStagiaireController::class, 'destroy']);
            Route::get('stagiaires/{stagiaire}/cv/pdf', [AdminStagiaireController::class, 'downloadPdf']);

            Route::get('applications', [AdminApplicationController::class, 'index']);

            Route::apiResource('filieres', AdminFiliereController::class)->only(['index', 'store', 'destroy']);
        });
    });

    Route::get('ping', fn () => response()->json(['ok' => true]));
});
