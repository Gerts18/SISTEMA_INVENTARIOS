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
        Schema::create('entradas_producto', function (Blueprint $table) {
            $table->increments('entrada_producto_id');
            $table->unsignedInteger('entrada_inv_id');
            $table->unsignedInteger('producto_id');
            $table->integer('cantidad');
            $table->timestamps();

            $table->foreign('entrada_inv_id')->references('entrada_inv_id')->on('entradas_inventario')->onDelete('cascade');
            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entradas_producto');
    }
};
