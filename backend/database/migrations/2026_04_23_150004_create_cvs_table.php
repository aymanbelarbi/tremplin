<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cvs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title', 150)->nullable();
            $table->text('summary')->nullable();

            $table->json('links')->nullable();
            $table->string('pdf_path', 255)->nullable();
            $table->boolean('is_finalized')->default(false);
            $table->timestamps();
        });

        Schema::create('cv_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_id')->constrained()->cascadeOnDelete();
            $table->string('position', 150);
            $table->string('company', 150);
            $table->string('city', 100)->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('cv_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_id')->constrained()->cascadeOnDelete();
            $table->string('degree', 150);
            $table->string('school', 150);
            $table->string('city', 100)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('cv_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);

            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('cv_languages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('level', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('cv_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cv_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->year('year')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });


    }

    public function down(): void
    {

        Schema::dropIfExists('cv_certifications');
        Schema::dropIfExists('cv_languages');
        Schema::dropIfExists('cv_skills');
        Schema::dropIfExists('cv_educations');
        Schema::dropIfExists('cv_experiences');
        Schema::dropIfExists('cvs');
    }
};
