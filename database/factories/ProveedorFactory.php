<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Proveedores\Proveedor;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proveedores\Proveedor>
 */
class ProveedorFactory extends Factory
{
    protected $model = Proveedor::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipos_empresa = [
            'Distribuidora', 'Comercial', 'Industrial', 'Mayorista', 
            'Importadora', 'Fabricante', 'Ferretería', 'Almacén'
        ];
        
        $nombres_empresa = [
            'Maderas del Norte', 'Construcción Total', 'Herrajes Premium', 'Acabados Profesionales',
            'Materiales Industriales', 'Suministros García', 'Distribuidora Central', 'Proveedora Nacional',
            'Maderas y Derivados', 'Ferretería Industrial', 'Herrajes Especializados', 'Barnices y Lacas',
            'Equipos y Herramientas', 'Materiales de Construcción', 'Distribuidora del Pacífico', 'Comercial Mexicana',
            'Importadora de Herramientas', 'Maderas Selectas', 'Herrajes de Calidad', 'Acabados Finos',
            'Suministros Técnicos', 'Distribuidora del Golfo', 'Materiales Premium', 'Ferretería Especializada',
            'Comercial del Centro', 'Proveedora del Bajío', 'Distribuidora Metropolitana', 'Maderas Tropicales',
            'Herrajes Importados', 'Acabados Especiales', 'Equipos Profesionales', 'Materiales Avanzados'
        ];
        
        $tipo = $this->faker->randomElement($tipos_empresa);
        $nombre_base = $this->faker->randomElement($nombres_empresa);
        
        // Agregar número único para evitar duplicados
        $numero_unico = $this->faker->unique()->numberBetween(1, 99999);
        
        // Obtener una categoría aleatoria de las 4 existentes (1-4)
        $categoria_id = $this->faker->numberBetween(1, 4);

        return [
            'nombre' => $tipo . ' ' . $nombre_base . ' #' . $numero_unico,
            'categoria_id' => $categoria_id,
        ];
    }
}
