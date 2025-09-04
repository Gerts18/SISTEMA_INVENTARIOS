<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Productos\Producto;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Productos\Producto>
 */
class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Productos organizados por tipo para generar variedad
        $productos_por_categoria = [
            1 => [ // Madera
                'productos' => [
                    'Tabla', 'Tablón', 'Viga', 'Contrachapado', 'MDF', 'Triplay', 
                    'Barrote', 'Durmiente', 'Poste', 'Moldura'
                ],
                'materiales' => ['pino', 'roble', 'cedro', 'caoba', 'encino', 'oyamel'],
                'medidas' => ['2x4', '2x6', '2x8', '4x4', '1x6', '1x8', '18mm', '15mm', '9mm'],
                'precio_min' => 50,
                'precio_max' => 800
            ],
            2 => [ // Herraje
                'productos' => [
                    'Tornillo', 'Clavo', 'Perno', 'Tuerca', 'Arandela', 'Bisagra',
                    'Cerradura', 'Manija', 'Aldaba', 'Candado'
                ],
                'materiales' => ['acero', 'galvanizado', 'inoxidable', 'latón', 'hierro'],
                'medidas' => ['1/4"', '1/2"', '3/4"', '1"', '2"', '3"', '#6', '#8', '#10', '#12'],
                'precio_min' => 5,
                'precio_max' => 150
            ],
            3 => [ // Barnis
                'productos' => [
                    'Barniz', 'Sellador', 'Tinte', 'Lacado', 'Protector', 'Aceite',
                    'Cera', 'Fondo', 'Satinado', 'Brillante'
                ],
                'materiales' => ['marino', 'UV', 'transparente', 'mate', 'satinado'],
                'medidas' => ['1L', '4L', '19L', '250ml', '500ml', '750ml'],
                'precio_min' => 80,
                'precio_max' => 500
            ],
            4 => [ // Equipos
                'productos' => [
                    'Taladro', 'Sierra', 'Lijadora', 'Router', 'Caladora', 'Esmeriladora',
                    'Martillo', 'Compresor', 'Pistola', 'Soldadora'
                ],
                'materiales' => ['inalámbrico', 'eléctrico', 'neumático', 'profesional', 'industrial'],
                'medidas' => ['7¼"', '4½"', '1HP', '2HP', '25L', '50L', '220V', '110V'],
                'precio_min' => 400,
                'precio_max' => 5000
            ]
        ];
        
        // Seleccionar categoría aleatoria
        $categoria_id = $this->faker->randomElement([1, 2, 3, 4]);
        $categoria_data = $productos_por_categoria[$categoria_id];
        
        // Generar componentes del nombre
        $producto_base = $this->faker->randomElement($categoria_data['productos']);
        $material = $this->faker->randomElement($categoria_data['materiales']);
        $medida = $this->faker->randomElement($categoria_data['medidas']);
        
        // Construir nombre del producto
        $nombre = $producto_base;
        if ($this->faker->boolean(70)) { // 70% incluir material
            $nombre .= " de {$material}";
        }
        if ($this->faker->boolean(60)) { // 60% incluir medida
            $nombre .= " {$medida}";
        }
        
        // Generar código único basado en categoría (máximo 6 caracteres)
        $prefijos = [1 => 'MD', 2 => 'HR', 3 => 'BR', 4 => 'EQ'];
        $codigo = $prefijos[$categoria_id] . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Generar precios realistas para la categoría
        $precio_lista = $this->faker->randomFloat(2, $categoria_data['precio_min'], $categoria_data['precio_max']);
        $precio_publico = round($precio_lista * $this->faker->randomFloat(2, 1.15, 2.8), 2);

        return [
            'nombre' => $nombre,
            'codigo' => $codigo,
            'stock' => $this->faker->numberBetween(0, 500),
            'precio_lista' => $precio_lista,
            'precio_publico' => $precio_publico,
            // proveedor_id se asignará desde el seeder
        ];
    }
}
