<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cvs', function (Blueprint $table) {
            $table->string('theme')->default('modern')->after('summary');
        });
    }

    public function down(): void
    {
        Schema::table('cvs', function (Blueprint $table) {
            $table->dropColumn('theme');
        });
    }
};
