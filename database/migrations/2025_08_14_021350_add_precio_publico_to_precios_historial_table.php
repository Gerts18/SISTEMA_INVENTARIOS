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
            // Renombrar la columna precio a precio_lista para mayor claridad
            $table->renameColumn('precio', 'precio_lista');
            // Agregar la nueva columna precio_publico
            $table->decimal('precio_publico', 10, 2)->after('precio')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precios_historial', function (Blueprint $table) {
            $table->dropColumn('precio_publico');
            $table->renameColumn('precio_lista', 'precio');
        });
    }
};
