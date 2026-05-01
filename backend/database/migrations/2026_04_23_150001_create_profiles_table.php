<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('employment_status', ['looking', 'employed'])->default('looking');
            $table->string('job_title', 150)->nullable();
            $table->string('job_company', 150)->nullable();
            $table->string('job_city', 100)->nullable();
            $table->date('job_start_date')->nullable();
            $table->date('birth_date')->nullable();

            $table->string('city', 100)->nullable();
            $table->string('photo_path', 255)->nullable();
            $table->string('filiere', 120)->nullable();
            $table->year('promotion')->nullable();
            $table->text('bio')->nullable();

            $table->json('loisirs')->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
