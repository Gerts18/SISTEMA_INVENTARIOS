<?php

// Script de prueba para verificar que el Observer funciona
// Ejecutar con: php artisan tinker < test_precio_historial.php

use App\Models\Productos\Producto;
use App\Models\Productos\PrecioHistorial;

echo "=== Prueba del Observer de Precio Historial ===\n";

// Buscar un producto existente
$producto = Producto::first();

if (!$producto) {
    echo "No hay productos en la base de datos.\n";
    echo "Creando un producto de prueba...\n";
    
    $producto = new Producto();
    $producto->nombre = 'Producto de Prueba';
    $producto->codigo = 'TEST01';
    $producto->stock = 100;
    $producto->precio_lista = 50.00;
    $producto->precio_publico = 75.00;
    $producto->proveedor_id = 1; // Asegúrate de que existe un proveedor con ID 1
    $producto->save();
    
    echo "Producto creado: " . $producto->nombre . "\n";
}

echo "Producto actual: " . $producto->nombre . " (ID: " . $producto->producto_id . ")\n";
echo "Precio lista actual: $" . $producto->precio_lista . "\n";
echo "Precio público actual: $" . $producto->precio_publico . "\n";

// Mostrar historial actual
$historial = PrecioHistorial::where('producto_id', $producto->producto_id)->get();
echo "Registros en historial antes de la actualización: " . $historial->count() . "\n";

// Actualizar el precio
$nuevoPrecioLista = $producto->precio_lista + 10;
$nuevoPrecioPublico = $producto->precio_publico + 15;

echo "Actualizando precios...\n";
echo "Nuevo precio lista: $" . $nuevoPrecioLista . "\n";
echo "Nuevo precio público: $" . $nuevoPrecioPublico . "\n";

$producto->precio_lista = $nuevoPrecioLista;
$producto->precio_publico = $nuevoPrecioPublico;
$producto->save();

// Verificar que se crearon los registros en el historial
$historialDespues = PrecioHistorial::where('producto_id', $producto->producto_id)->get();
echo "Registros en historial después de la actualización: " . $historialDespues->count() . "\n";

echo "\n=== Historial de Precios ===\n";
foreach ($historialDespues->sortBy('created_at') as $registro) {
    echo "Fecha: " . $registro->fecha_cambio . " | Precio: $" . $registro->precio . " | Tipo: " . $registro->tipo_cambio . "\n";
}

echo "\n=== Prueba completada ===\n";
