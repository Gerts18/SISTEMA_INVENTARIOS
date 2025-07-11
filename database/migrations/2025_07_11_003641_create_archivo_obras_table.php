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
        Schema::create('archivos_obra', function (Blueprint $table) {
            $table->increments('archivo_id');
            $table->unsignedInteger('obra_id');
            $table->string('nombre_archivo', 255);
            $table->text('url_archivo', 500)->nullable();
            $table->timestamps();

            $table->foreign('obra_id')
                ->references('obra_id')
                ->on('obras')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos_obra');
    }
};
