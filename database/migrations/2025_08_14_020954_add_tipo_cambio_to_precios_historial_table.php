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
        Schema::table('precios_historial', function (Blueprint $table) {
            $table->string('tipo_cambio', 50)->after('fecha_cambio')->default('actualizacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precios_historial', function (Blueprint $table) {
            $table->dropColumn('tipo_cambio');
        });
    }
};
