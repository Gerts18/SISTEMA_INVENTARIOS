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
        Schema::table('archivos_obra', function (Blueprint $table) {
            $table->string('url_thumbnail')->nullable()->after('url_archivo');
            $table->unsignedInteger('clics_count')->default(0)->after('url_thumbnail');
        });

        Schema::table('gestion_inventario', function (Blueprint $table) {
            $table->string('imagen_comprobante_thumb')->nullable()->after('imagen_comprobante');
            $table->unsignedInteger('clics_count')->default(0)->after('imagen_comprobante_thumb');
        });

        Schema::table('solicitudes_material', function (Blueprint $table) {
            $table->unsignedInteger('clics_count')->default(0)->after('reporte_generado_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archivos_obra', function (Blueprint $table) {
            $table->dropColumn(['url_thumbnail', 'clics_count']);
        });

        Schema::table('gestion_inventario', function (Blueprint $table) {
            $table->dropColumn(['imagen_comprobante_thumb', 'clics_count']);
        });

        Schema::table('solicitudes_material', function (Blueprint $table) {
            $table->dropColumn(['clics_count']);
        });
    }
};
