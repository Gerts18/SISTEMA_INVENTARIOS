<?php

namespace App\Observers;

use App\Models\Productos\Producto;
use App\Models\Productos\PrecioHistorial;
use Carbon\Carbon;

class ProductoObserver
{
    /**
     * Handle the Producto "created" event.
     */
    public function created(Producto $producto): void
    {
        // Guardar ambos precios iniciales en un solo registro cuando se crea un producto
        $this->crearRegistroHistorial($producto, $producto->precio_lista, $producto->precio_publico, 'creacion');
    }

    /**
     * Handle the Producto "updated" event.
     */
    public function updated(Producto $producto): void
    {
        // Verificar si alguno de los precios cambió
        $precioListaCambio = $producto->isDirty('precio_lista');
        $precioPublicoCambio = $producto->isDirty('precio_publico');
        
        if ($precioListaCambio || $precioPublicoCambio) {
            // Crear un registro con ambos precios actuales
            $this->crearRegistroHistorial(
                $producto, 
                $producto->precio_lista, 
                $producto->precio_publico, 
                'actualizacion'
            );
        }
    }

    /**
     * Crear un registro en el historial de precios
     */
    private function crearRegistroHistorial(Producto $producto, $precioLista, $precioPublico, $tipoCambio): void
    {
        PrecioHistorial::create([
            'producto_id' => $producto->producto_id,
            'precio_lista' => $precioLista,
            'precio_publico' => $precioPublico,
            'fecha_cambio' => Carbon::now()->toDateString(),
            'tipo_cambio' => $tipoCambio
        ]);
    }

    /**
     * Handle the Producto "deleted" event.
     */
    public function deleted(Producto $producto): void
    {
        //
    }

    /**
     * Handle the Producto "restored" event.
     */
    public function restored(Producto $producto): void
    {
        //
    }

    /**
     * Handle the Producto "force deleted" event.
     */
    public function forceDeleted(Producto $producto): void
    {
        //
    }
}
