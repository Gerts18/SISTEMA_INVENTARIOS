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
        Schema::table('solicitudes_material', function (Blueprint $table) {
            $table->dropForeign(['obra_id']);
            $table->foreign('obra_id')
                ->references('obra_id')
                ->on('obras')
                ->onDelete('cascade');
        });

        Schema::table('reportes', function (Blueprint $table) {
            $table->dropForeign(['obra_id']);
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
        Schema::table('solicitudes_material', function (Blueprint $table) {
            $table->dropForeign(['obra_id']);
            $table->foreign('obra_id')
                ->references('obra_id')
                ->on('obras');
        });

        Schema::table('reportes', function (Blueprint $table) {
            $table->dropForeign(['obra_id']);
            $table->foreign('obra_id')
                ->references('obra_id')
                ->on('obras');
        });
    }
};
