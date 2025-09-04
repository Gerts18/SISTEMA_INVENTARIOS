<?php

// Script de prueba para verificar que el Observer funciona con ambos precios
// Ejecutar manualmente en tinker

use App\Models\Productos\Producto;
use App\Models\Productos\PrecioHistorial;

echo "=== Prueba del Observer con Dos Precios ===\n";

// Buscar un producto existente
$producto = Producto::find(2); // Usar el producto que sabemos que existe

if (!$producto) {
    echo "Producto no encontrado.\n";
    exit;
}

echo "Producto actual: " . $producto->nombre . " (ID: " . $producto->producto_id . ")\n";
echo "Precio lista actual: $" . $producto->precio_lista . "\n";
echo "Precio público actual: $" . $producto->precio_publico . "\n";

// Limpiar registros previos para la prueba
PrecioHistorial::where('producto_id', $producto->producto_id)->delete();

// Mostrar historial actual
$historial = PrecioHistorial::where('producto_id', $producto->producto_id)->get();
echo "Registros en historial antes de la actualización: " . $historial->count() . "\n";

// Actualizar ambos precios
$nuevoPrecioLista = $producto->precio_lista + 5;
$nuevoPrecioPublico = $producto->precio_publico + 10;

echo "Actualizando precios...\n";
echo "Nuevo precio lista: $" . $nuevoPrecioLista . "\n";
echo "Nuevo precio público: $" . $nuevoPrecioPublico . "\n";

$producto->precio_lista = $nuevoPrecioLista;
$producto->precio_publico = $nuevoPrecioPublico;
$producto->save();

// Verificar que se creó solo UN registro en el historial
$historialDespues = PrecioHistorial::where('producto_id', $producto->producto_id)->get();
echo "Registros en historial después de la actualización: " . $historialDespues->count() . "\n";

echo "\n=== Historial de Precios ===\n";
foreach ($historialDespues->sortBy('created_at') as $registro) {
    echo "Fecha: " . $registro->fecha_cambio . 
         " | Precio Lista: $" . $registro->precio_lista . 
         " | Precio Público: $" . $registro->precio_publico . 
         " | Tipo: " . $registro->tipo_cambio . "\n";
}

echo "\n=== Ahora probemos actualizar solo un precio ===\n";

// Actualizar solo el precio público
$nuevoPrecioPublico2 = $nuevoPrecioPublico + 5;
echo "Actualizando solo precio público a: $" . $nuevoPrecioPublico2 . "\n";

$producto->precio_publico = $nuevoPrecioPublico2;
$producto->save();

$historialFinal = PrecioHistorial::where('producto_id', $producto->producto_id)->get();
echo "Total de registros en historial: " . $historialFinal->count() . "\n";

echo "\n=== Historial Final ===\n";
foreach ($historialFinal->sortBy('created_at') as $registro) {
    echo "Fecha: " . $registro->fecha_cambio . 
         " | Precio Lista: $" . $registro->precio_lista . 
         " | Precio Público: $" . $registro->precio_publico . 
         " | Tipo: " . $registro->tipo_cambio . "\n";
}

echo "\n=== Prueba completada ===\n";
