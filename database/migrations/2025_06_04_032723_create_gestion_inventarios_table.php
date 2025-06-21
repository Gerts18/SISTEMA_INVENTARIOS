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
        Schema::create('gestion_inventario', function (Blueprint $table) {
            $table->increments('gestion_inv_id');
            $table->unsignedBigInteger('usuario_id');
            $table->date('fecha');
            $table->text('imagen_comprobante')->nullable();
            $table->enum('tipo_gestion', ['Entrada', 'Salida'])->default('Entrada');
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gestion_inventario');
    }
};
