<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registro_obras', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('obra_id');
            $table->date('fecha');
            $table->string('concepto', 100);
            $table->timestamps();

            $table->foreign('obra_id')->references('obra_id')->on('obras')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registro_obras');
    }
};
