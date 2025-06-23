<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Proveedores\Proveedor;

class ProveedorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $proveedores = [
            [
                'nombre' => 'Proveedor Lijas',
                'categoria_id' => 1,
            ],
            [
                'nombre' => 'Proveedor Tornillos',
                'categoria_id' => 2,
            ],
            [
                'nombre' => 'Proveedor Barniz',
                'categoria_id' => 2,
            ],
            [
                'nombre' => 'Proveedor Sierra',
                'categoria_id' => 3,
            ],
            [
                'nombre' => 'Proveedor Taladro',
                'categoria_id' => 4,
            ],
        ];

        foreach ($proveedores as $proveedor) {
            Proveedor::create($proveedor);
        }
    }
}
