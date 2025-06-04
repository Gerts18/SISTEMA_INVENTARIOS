<?php

namespace Database\Seeders;

use App\Models\Productos\CategoriaProducto;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoriaProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         CategoriaProducto::create([
            'nombre' => 'Madera',
        ]);
        CategoriaProducto::create([
            'nombre' => 'Herraje',
        ]);
         CategoriaProducto::create([
            'nombre' => 'Barnis',
        ]);
         CategoriaProducto::create([
            'nombre' => 'Equipos',
        ]);
    }
}
