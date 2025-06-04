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
         Schema::create('precios_historial', function (Blueprint $table) {
            $table->increments('historial_id');
            $table->unsignedInteger('producto_id');
            $table->decimal('precio');
            $table->date('fecha_cambio');
            $table->timestamps();

            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('precios_historial');
    }
};
