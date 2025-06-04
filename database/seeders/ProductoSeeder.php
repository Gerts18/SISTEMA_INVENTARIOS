<?php

namespace Database\Seeders;

use App\Models\Productos\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        $productos = [
            [
                'nombre' => 'Lijas',
                'codigo' => '000001',
                'stock' => 0,
                'precio_actual' => 1200.00,
                'categoria_id' => 1,
            ],
            [
                'nombre' => 'Tornillos de Madera',
                'codigo' => '000002',
                'stock' => 0,
                'precio_actual' => 25.50,
                'categoria_id' => 2,
            ],
            [
                'nombre' => 'Barniz al Agua',
                'codigo' => '000003',
                'stock' => 0,
                'precio_actual' => 75.00,
                'categoria_id' => 2,
            ],
            [
                'nombre' => 'Sierra Circular',
                'codigo' => '000004',
                'stock' => 0,
                'precio_actual' => 200.00,
                'categoria_id' => 3,
            ],
            [
                'nombre' => 'Taladro Inalambrico',
                'codigo' => '000005',
                'stock' => 0,
                'precio_actual' => 350.00,
                'categoria_id' => 4,
            ],
        ];

        foreach ($productos as $producto) {
            Producto::create($producto);
        }
    }
}
