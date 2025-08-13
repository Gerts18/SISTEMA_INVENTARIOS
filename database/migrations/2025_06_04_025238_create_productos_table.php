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
        Schema::create('productos', function (Blueprint $table) {
            $table->increments('producto_id');
            $table->string('nombre', 255);
            $table->string('codigo',6)->unique();
            $table->unsignedInteger('stock')->default(0);
            $table->decimal('precio_lista',10,2)->unsigned();
            $table->decimal('precio_publico',10,2)->unsigned();
            $table->unsignedInteger('proveedor_id');
            $table->timestamps();

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
        Schema::dropIfExists('productos');
    }
};
