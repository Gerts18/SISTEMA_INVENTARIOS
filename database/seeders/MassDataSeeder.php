<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Productos\Producto;
use App\Models\Proveedores\Proveedor;

class MassDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Iniciando generación masiva de datos...');
        
        // 1. Crear 40 proveedores nuevos usando Factory
        $this->command->info('📦 Creando 40 proveedores...');
        $proveedores = Proveedor::factory()->count(40)->create();
        $this->command->info("✅ {$proveedores->count()} proveedores creados");
        
        // 2. Obtener todos los proveedores (incluyendo los existentes)
        $todosLosProveedores = Proveedor::all();
        $this->command->info("📋 Total proveedores disponibles: {$todosLosProveedores->count()}");
        
        // 3. Seleccionar un proveedor "grande" que tendrá 2000 productos
        $proveedorGrande = $todosLosProveedores->random();
        $this->command->info("🏢 Proveedor principal: {$proveedorGrande->nombre} (tendrá 2000 productos)");
        
        // 4. Crear 2000 productos para el proveedor grande
        $this->command->info('📦 Creando 2000 productos para el proveedor principal...');
        
        $productosGrandes = [];
        for ($i = 0; $i < 2000; $i++) {
            $producto = Producto::factory()->make();
            $producto->proveedor_id = $proveedorGrande->proveedor_id;
            $productosGrandes[] = $producto->toArray();
            
            // Insertar en lotes de 100 para mejor rendimiento
            if (count($productosGrandes) == 100) {
                Producto::insert($productosGrandes);
                $productosGrandes = [];
                
                if (($i + 1) % 500 == 0) {
                    $this->command->info("  ✓ " . ($i + 1) . "/2000 productos del proveedor principal");
                }
            }
        }
        
        // Insertar productos restantes
        if (!empty($productosGrandes)) {
            Producto::insert($productosGrandes);
        }
        
        $this->command->info("✅ 2000 productos creados para {$proveedorGrande->nombre}");
        
        // 5. Crear 3000 productos restantes distribuidos entre otros proveedores
        $this->command->info('📦 Creando 3000 productos para otros proveedores...');
        
        $otrosProveedores = $todosLosProveedores->where('proveedor_id', '!=', $proveedorGrande->proveedor_id);
        $productosOtros = [];
        
        for ($i = 0; $i < 3000; $i++) {
            $proveedorAleatorio = $otrosProveedores->random();
            $producto = Producto::factory()->make();
            $producto->proveedor_id = $proveedorAleatorio->proveedor_id;
            $productosOtros[] = $producto->toArray();
            
            // Insertar en lotes de 100
            if (count($productosOtros) == 100) {
                Producto::insert($productosOtros);
                $productosOtros = [];
                
                if (($i + 1) % 500 == 0) {
                    $this->command->info("  ✓ " . ($i + 1) . "/3000 productos distribuidos");
                }
            }
        }
        
        // Insertar productos restantes
        if (!empty($productosOtros)) {
            Producto::insert($productosOtros);
        }
        
        $this->command->info("✅ 3000 productos distribuidos entre otros proveedores");
        
        // 6. Mostrar estadísticas finales
        $this->command->info('');
        $this->command->info('🎉 ¡Generación completada exitosamente!');
        $this->command->info('📊 Estadísticas finales:');
        
        $totalProveedores = Proveedor::count();
        $totalProductos = Producto::count();
        $productosProveedorGrande = Producto::where('proveedor_id', $proveedorGrande->proveedor_id)->count();
        
        $this->command->info("  🏢 Total proveedores: {$totalProveedores}");
        $this->command->info("  📦 Total productos: {$totalProductos}");
        $this->command->info("  🔥 Productos del proveedor principal: {$productosProveedorGrande}");
        
        // Distribución por categoría
        $this->command->info('');
        $this->command->info('📋 Distribución por categoría:');
        for ($cat = 1; $cat <= 4; $cat++) {
            $proveedoresCat = Proveedor::where('categoria_id', $cat)->count();
            $nombresCat = [1 => 'Madera', 2 => 'Herraje', 3 => 'Barnis', 4 => 'Equipos'];
            $this->command->info("  📁 {$nombresCat[$cat]}: {$proveedoresCat} proveedores");
        }
        
        $this->command->info('');
        $this->command->warn('💡 NOTA: El Observer registrará automáticamente el historial cuando edites precios desde la interfaz.');
        $this->command->info('🚀 ¡Tu sistema ya está listo para pruebas de rendimiento con 5000 productos!');
    }
}
