<?php

namespace App\Http\Controllers\Productos;

use App\Http\Controllers\Controller;
use App\Models\Productos\Producto;
use App\Models\Productos\PrecioHistorial;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductosController extends Controller
{
    /**
     * Actualizar un producto
     */
    public function update(Request $request, $id)
    {
        try {
            $producto = Producto::findOrFail($id);
            
            // Validar los datos
            $request->validate([
                'precio_lista' => 'sometimes|required|numeric|min:0',
                'precio_publico' => 'sometimes|required|numeric|min:0',
                'nombre' => 'sometimes|required|string|max:255',
                'stock' => 'sometimes|required|integer|min:0',
            ]);

            // Actualizar el producto
            // El Observer automáticamente guardará los cambios de precio en el historial
            $producto->update($request->only([
                'precio_lista', 
                'precio_publico', 
                'nombre', 
                'stock'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado exitosamente',
                'producto' => $producto->load('preciosHistorial') // Incluir el historial
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el producto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de precios de un producto
     */
    public function obtenerHistorialPrecios($id)
    {
        try {
            $producto = Producto::with(['preciosHistorial' => function ($query) {
                $query->orderBy('fecha_cambio', 'desc')->orderBy('created_at', 'desc');
            }])->findOrFail($id);

            // Formatear el historial para mejor legibilidad
            $historialFormateado = $producto->preciosHistorial->map(function ($registro) {
                return [
                    'id' => $registro->historial_id,
                    'fecha_cambio' => $registro->fecha_cambio,
                    'precio_lista' => number_format($registro->precio_lista, 2),
                    'precio_publico' => number_format($registro->precio_publico, 2),
                    'tipo_cambio' => $registro->tipo_cambio,
                    'created_at' => $registro->created_at->format('Y-m-d H:i:s')
                ];
            });

            return response()->json([
                'success' => true,
                'producto' => $producto->only(['producto_id', 'nombre', 'codigo', 'precio_lista', 'precio_publico']),
                'historial' => $historialFormateado
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el historial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request)
    {
        try {
            // Validar los datos
            $request->validate(Producto::$rules);

            // Crear el producto
            // El Observer automáticamente guardará el precio inicial en el historial
            $producto = Producto::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'producto' => $producto->load('preciosHistorial')
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el producto: ' . $e->getMessage()
            ], 500);
        }
    }
}
