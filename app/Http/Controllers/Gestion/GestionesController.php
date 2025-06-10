<?php

namespace App\Http\Controllers\Gestion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Productos\Producto;

class GestionesController extends Controller
{
    public function show()
    {
        return Inertia::render(
            'Gestion/GestionPage',
            [
                'contador' => 0
            ]
        );
    }

    public function consultarProducto(Request $request)
    {
        $codigo = $request->query('codigo');

        $producto = Producto::with('categoria')->where('codigo', $codigo)->first();

        if (!$producto) {
            return Inertia::render(
                'Gestion/GestionPage',
                [
                    'producto' => null,
                    'flash' => ['error' => 'Producto no encontrado.'],
                ]
            );
        }

        return Inertia::render(
            'Gestion/GestionPage',
            [
                'producto' => [
                    'codigo' => $producto->codigo,
                    'nombre' => $producto->nombre,
                    'stock' => $producto->stock,
                    'categoria' => $producto->categoria?->nombre ?? 'Sin categoría',
                ],
            ]
        );
    }
}
