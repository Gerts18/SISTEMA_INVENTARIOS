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
        Schema::table('productos', function (Blueprint $table) {
            // Primero eliminar la foreign key constraint
            $table->dropForeign(['proveedor_id']);

            // Modificar la columna para que sea nullable
            $table->unsignedInteger('proveedor_id')->nullable()->change();

            // Volver a agregar la foreign key con set null
            $table->foreign('proveedor_id')
                ->references('proveedor_id')
                ->on('proveedores')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            // Eliminar la foreign key
            $table->dropForeign(['proveedor_id']);

            // Revertir la columna a NOT NULL
            $table->unsignedInteger('proveedor_id')->nullable(false)->change();

            // Volver a agregar la foreign key
            $table->foreign('proveedor_id')
                ->references('proveedor_id')
                ->on('proveedores')
                ->onDelete('set null');
        });
    }
};
