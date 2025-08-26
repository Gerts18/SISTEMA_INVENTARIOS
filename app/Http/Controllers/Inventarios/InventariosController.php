<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use App\Models\Productos\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Productos\CategoriaProducto;
use App\Models\Proveedores\Proveedor;

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

    public function showProveedores()
    {
        $proveedores = Proveedor::all(['proveedor_id' ,'nombre', 'categoria_id']);

        return response()->json([
            'proveedores' => $proveedores,
        ]);
    }

    public function buscarPorCodigo($codigo)
    {
        $producto = Producto::where('codigo', $codigo)->first();

        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado.'], 404);
        }

        return response()->json(['producto' => $producto]);
    }

    public function productosPorProveedor($proveedor_id)
    {
        $productos = Producto::where('proveedor_id', $proveedor_id)
            ->select('producto_id', 'nombre', 'codigo', 'stock', 'precio_lista', 'precio_publico', 'proveedor_id')
            ->orderBy('created_at', 'asc') // Ordenar por fecha de creación (más antiguos primero)
            ->simplePaginate(10);
        
        return response()->json([
            'productos' => $productos->items(), 
            'pagination' => [
                'next_page' => $productos->nextPageUrl(),
                'prev_page' => $productos->previousPageUrl(),
                'current_page' => $productos->currentPage()
            ]
        ]);
    }


    public function productosPorCategoria($categoria_id)
    {
        $productos = Producto::join('proveedores', 'productos.proveedor_id', '=', 'proveedores.proveedor_id')
            ->where('proveedores.categoria_id', $categoria_id)
            ->select('productos.producto_id', 'productos.nombre', 'productos.codigo', 'productos.stock', 'productos.precio_lista', 'productos.precio_publico')
            ->orderBy('productos.created_at', 'asc') // Ordenar por fecha de creación (más antiguos primero)
            ->simplePaginate(10);
        
        return response()->json([
            'productos' => $productos->items(), 
            'pagination' => [
                'next_page' => $productos->nextPageUrl(),
                'prev_page' => $productos->previousPageUrl(),
                'current_page' => $productos->currentPage()
            ]
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

    public function storeProveedor(Request $request)
    {
        // Mensajes personalizados para la validación
        $messages = [
            'nombre.required' => 'El nombre del proveedor es obligatorio.',
            'nombre.unique' => 'Ya existe un proveedor con ese nombre.',
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
        ];

        // Validación de los datos del formulario
        $request->validate([
            'nombre' => 'required|string|max:255|unique:proveedores,nombre',
            'categoria_id' => 'required|exists:categorias_productos,categoria_id',
        ], $messages);

        // Crear un nuevo proveedor
        Proveedor::create([
            'nombre' => $request->nombre,
            'categoria_id' => $request->categoria_id,
        ]);

        // Redirigir con un mensaje de éxito
        return redirect()->route('inventario')->with('success', 'Producto creado exitosamente.');    }

    public function store(Request $request)
    {
        $messages = [
            'nombre.required' => 'El nombre del proveedor es obligatorio.',
            'codigo.required' => 'El código del producto es obligatorio.',
            'codigo.max' => 'El código no debe ser mayor a 6 caracteres.',
            'codigo.unique' => 'Este código ya está en uso.',
            'stock.integer' => 'La cantidad debe ser un número entero.',
            'stock.min' => 'La cantidad no puede ser negativa.',
            'precio_lista.required' => 'El precio de lista es obligatorio.',
            'precio_lista.numeric' => 'El precio de lista debe ser un número.',
            'precio_lista.min' => 'El precio de lista debe ser mayor o igual a 0.',
            'precio_publico.required' => 'El precio público es obligatorio.',
            'precio_publico.numeric' => 'El precio público debe ser un número.',
            'precio_publico.min' => 'El precio público debe ser mayor o igual a 0.',
            'categoria_id.required' => 'Debe seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
        ];

        // Validación con mensajes personalizados
        $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:6|unique:productos,codigo',
            'stock' => 'integer|min:0',
            'precio_lista' => 'required|numeric|min:0',
            'precio_publico' => 'required|numeric|min:0',
            'proveedor_id' => 'required|exists:proveedores,proveedor_id',
        ], $messages);

        Producto::create($request->all());

        return redirect()->route('inventario')->with('success', 'Producto creado exitosamente.');
    }
}
