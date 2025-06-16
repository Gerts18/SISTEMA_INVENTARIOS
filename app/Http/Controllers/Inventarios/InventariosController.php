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

    public function buscarPorCodigo($codigo)
    {
        $producto = Producto::where('codigo', $codigo)->first();

        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado.'], 404);
        }

        return response()->json(['producto' => $producto]);
    }


    public function productosPorCategoria($categoria_id)
    {
        $productos = Producto::where('categoria_id', $categoria_id)
            ->select('producto_id', 'nombre', 'codigo', 'stock', 'precio_actual') // ajusta si quieres más/menos campos
            ->get();
        
        return response()->json([
            'productos' => $productos,
        ]);
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
    $messages = [
        'nombre.required' => 'El nombre del producto es obligatorio.',
        'codigo.required' => 'El código del producto es obligatorio.',
        'codigo.max' => 'El código no debe ser mayor a 6 caracteres.',
        'codigo.unique' => 'Este código ya está en uso.',
        'stock.integer' => 'La cantidad debe ser un número entero.',
        'stock.min' => 'La cantidad no puede ser negativa.',
        'precio_actual.required' => 'El precio es obligatorio.',
        'precio_actual.numeric' => 'El precio debe ser un número.',
        'precio_actual.min' => 'El precio debe ser mayor o igual a 0.',
        'categoria_id.required' => 'Debe seleccionar una categoría.',
        'categoria_id.exists' => 'La categoría seleccionada no existe.',
    ];

    // Validación con mensajes personalizados
    $request->validate([
        'nombre' => 'required|string|max:255',
        'codigo' => 'required|string|max:6|unique:productos,codigo',
        'stock' => 'integer|min:0',
        'precio_actual' => 'required|numeric|min:0',
        'categoria_id' => 'required|exists:categorias_productos,categoria_id',
    ], $messages);

    Producto::create($request->all());

    return redirect()->route('inventario')->with('success', 'Producto creado exitosamente.');
}

}
