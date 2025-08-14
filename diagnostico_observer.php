<?php

// Script de diagnóstico para verificar el comportamiento completo
// Copiar y pegar en tinker

use App\Models\Productos\Producto;
use App\Models\Productos\PrecioHistorial;

echo "=== Diagnóstico del Observer y Actualización ===\n";

// Buscar un producto
$producto = Producto::find(2);

if (!$producto) {
    echo "Producto no encontrado\n";
    exit;
}

echo "--- ESTADO INICIAL ---\n";
echo "Producto: {$producto->nombre} (ID: {$producto->producto_id})\n";
echo "Precio lista en BD: $" . $producto->precio_lista . "\n";
echo "Precio público en BD: $" . $producto->precio_publico . "\n";

// Limpiar historial para esta prueba
PrecioHistorial::where('producto_id', $producto->producto_id)->delete();
$historialInicial = PrecioHistorial::where('producto_id', $producto->producto_id)->count();
echo "Registros en historial: {$historialInicial}\n";

echo "\n--- ACTUALIZANDO PRECIOS ---\n";
$precioListaOriginal = $producto->precio_lista;
$precioPublicoOriginal = $producto->precio_publico;

$nuevoPrecioLista = $precioListaOriginal + 10;
$nuevoPrecioPublico = $precioPublicoOriginal + 20;

echo "Precio lista original: $" . $precioListaOriginal . "\n";
echo "Precio público original: $" . $precioPublicoOriginal . "\n";
echo "Nuevo precio lista: $" . $nuevoPrecioLista . "\n";
echo "Nuevo precio público: $" . $nuevoPrecioPublico . "\n";

// Actualizar paso a paso
echo "Asignando nuevos valores...\n";
$producto->precio_lista = $nuevoPrecioLista;
$producto->precio_publico = $nuevoPrecioPublico;

echo "Valores antes de save():\n";
echo "  - precio_lista: $" . $producto->precio_lista . "\n";
echo "  - precio_publico: $" . $producto->precio_publico . "\n";
echo "  - isDirty('precio_lista'): " . ($producto->isDirty('precio_lista') ? 'SÍ' : 'NO') . "\n";
echo "  - isDirty('precio_publico'): " . ($producto->isDirty('precio_publico') ? 'SÍ' : 'NO') . "\n";

echo "Ejecutando save()...\n";
$resultado = $producto->save();
echo "Resultado de save(): " . ($resultado ? 'EXITOSO' : 'FALLÓ') . "\n";

echo "\n--- VERIFICANDO RESULTADOS ---\n";
// Recargar el producto desde la BD
$productoActualizado = Producto::find($producto->producto_id);
echo "Precio lista después de save(): $" . $productoActualizado->precio_lista . "\n";
echo "Precio público después de save(): $" . $productoActualizado->precio_publico . "\n";

// Verificar historial
$historialDespues = PrecioHistorial::where('producto_id', $producto->producto_id)->count();
echo "Registros en historial después: {$historialDespues}\n";

if ($historialDespues > 0) {
    $ultimoRegistro = PrecioHistorial::where('producto_id', $producto->producto_id)
        ->orderBy('created_at', 'desc')
        ->first();
    
    echo "Último registro del historial:\n";
    echo "  - precio_lista: $" . $ultimoRegistro->precio_lista . "\n";
    echo "  - precio_publico: $" . $ultimoRegistro->precio_publico . "\n";
    echo "  - tipo_cambio: {$ultimoRegistro->tipo_cambio}\n";
    echo "  - fecha_cambio: {$ultimoRegistro->fecha_cambio}\n";
}

echo "\n--- RESUMEN ---\n";
$preciosActualizados = ($productoActualizado->precio_lista == $nuevoPrecioLista && 
                      $productoActualizado->precio_publico == $nuevoPrecioPublico);
$historialCreado = $historialDespues > $historialInicial;

echo "¿Precios actualizados en productos? " . ($preciosActualizados ? 'SÍ' : 'NO') . "\n";
echo "¿Registro creado en historial? " . ($historialCreado ? 'SÍ' : 'NO') . "\n";

if (!$preciosActualizados) {
    echo "ERROR: Los precios no se actualizaron en la tabla productos\n";
}

if (!$historialCreado) {
    echo "ERROR: No se creó registro en el historial\n";
}

if ($preciosActualizados && $historialCreado) {
    echo "✓ TODO FUNCIONÓ CORRECTAMENTE\n";
}

echo "\n=== Fin del diagnóstico ===\n";
