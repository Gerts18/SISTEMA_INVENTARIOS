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
        Schema::create('salidas_inventario', function (Blueprint $table) {
            $table->increments('salida_inv_id');
            $table->unsignedBigInteger('usuario_id');
            $table->date('fecha');
            $table->text('imagen_solicitud')->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salidas_inventario');
    }
};
