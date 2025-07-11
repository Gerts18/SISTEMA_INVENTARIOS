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
        Schema::create('solicitudes_material', function (Blueprint $table) {
            $table->increments('solicitud_id');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('obra_id');
            $table->date('fecha_solicitud');
            $table->string('concepto', 500);
            $table->text('reporte_generado_url')->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

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
        Schema::dropIfExists('solicitudes_material');
    }
};
