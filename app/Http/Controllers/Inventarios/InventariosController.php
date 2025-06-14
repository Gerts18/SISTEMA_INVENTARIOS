<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use App\Models\Productos\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Productos\CategoriaProducto;

class InventariosController extends Controller
{

    public $contador = 1;

    public function show()
    {
        return Inertia::render('Inventario/InventarioPage',
            [
                'contador' => $this->contador
            ]
        );
    }

    public function catalogo(){
        $categorias = CategoriaProducto::all(['categoria_id', 'nombre']);

        return response()->json([
            'categorias' => $categorias,
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventario/CrearInventario');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:6|unique:productos,codigo',
            'stock' => 'integer|min:0',
            'precio_actual' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias_productos,categoria_id',
        ]);
        Producto::create($request->all());
        // Aquí se guardaría el producto en la base de datos
        // Producto::create($request->all());

        return redirect()->route('inventario')->with('success', 'Producto creado exitosamente.');
    }
}
