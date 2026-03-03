<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entregas', function (Blueprint $table) {
            $table->id('entrega_id');
            $table->unsignedBigInteger('obra_id');
            $table->unsignedBigInteger('creador_id');
            $table->string('titulo', 255);
            $table->text('descripcion')->nullable();
            $table->string('estado_general', 20)->default('en_curso'); // en_curso, completado
            $table->timestamps();

            $table->foreign('obra_id')->references('obra_id')->on('obras')->onDelete('cascade');
            $table->foreign('creador_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('entrega_transiciones', function (Blueprint $table) {
            $table->id('transicion_id');
            $table->unsignedBigInteger('entrega_id');
            $table->unsignedBigInteger('remitente_id');
            $table->unsignedBigInteger('destinatario_id');
            $table->string('estado', 20)->default('no_recibido'); // no_recibido, recibido, faltante
            $table->text('comentario')->nullable();
            $table->date('fecha');
            $table->boolean('es_devolucion')->default(false);
            $table->timestamps();

            $table->foreign('entrega_id')->references('entrega_id')->on('entregas')->onDelete('cascade');
            $table->foreign('remitente_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('destinatario_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entrega_transiciones');
        Schema::dropIfExists('entregas');
    }
};
