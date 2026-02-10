<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use App\Models\Productos\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Productos\CategoriaProducto;
use App\Models\Proveedores\Proveedor;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventariosController extends Controller
{

    public $contador = 1;

    public function show()
    {
        return Inertia::render(
            'Inventario/InventarioPage',
            [
                'contador' => $this->contador
            ]
        );
    }

    // Métodos de proveedores comentados - funcionalidad removida
    /*
    public function showProveedores()
    {
        $proveedores = Proveedor::all(['proveedor_id' ,'nombre', 'categoria_id']);

        return response()->json([
            'proveedores' => $proveedores,
        ]);
    }
    */

    // Búsqueda de productos por nombre (parcial o completo)
    public function buscarPorNombre($nombre)
    {
        // Decodificar y limpiar el nombre
        $nombre = urldecode($nombre);
        $nombre = trim($nombre);

        // Si está vacío, devolver lista paginada
        if (empty($nombre)) {
            return $this->listarProductos(request());
        }

        // Búsqueda parcial por nombre (case insensitive)
        $productos = Producto::whereRaw('LOWER(nombre) LIKE ?', ['%' . strtolower($nombre) . '%'])
            ->select('producto_id', 'nombre', 'codigo', 'stock', 'precio_lista', 'precio_publico')
            ->orderBy('nombre', 'asc')
            ->limit(20) // Limitar resultados
            ->get();

        if ($productos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron productos con ese nombre.'], 404);
        }

        return response()->json(['productos' => $productos]);
    }

    // Métodos de proveedores comentados - funcionalidad removida
    /*
    public function productosPorProveedor($proveedor_id)
    {
        $productos = Producto::where('proveedor_id', $proveedor_id)
            ->select('producto_id', 'nombre', 'codigo', 'stock', 'precio_lista', 'precio_publico', 'proveedor_id')
            ->orderBy('created_at', 'asc')
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
    */


    // Métodos de categorías comentados - funcionalidad removida
    /*
    public function productosPorCategoria($categoria_id)
    {
        $productos = Producto::join('proveedores', 'productos.proveedor_id', '=', 'proveedores.proveedor_id')
            ->where('proveedores.categoria_id', $categoria_id)
            ->select('productos.producto_id', 'productos.nombre', 'productos.codigo', 'productos.stock', 'productos.precio_lista', 'productos.precio_publico')
            ->orderBy('productos.created_at', 'asc')
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
    */

    // Nuevo método para listar todos los productos con paginación y ordenamiento
    public function listarProductos(Request $request)
    {
        // Obtener parámetro de ordenamiento (asc o desc)
        $orden = $request->query('orden', 'desc'); // Por defecto: más recientes primero

        // Validar que el orden sea válido
        if (!in_array($orden, ['asc', 'desc'])) {
            $orden = 'desc';
        }

        $productos = Producto::select('producto_id', 'nombre', 'codigo', 'stock', 'precio_lista', 'precio_publico')
            ->orderBy('created_at', $orden)
            ->simplePaginate(20);

        return response()->json([
            'productos' => $productos->items(),
            'pagination' => [
                'next_page' => $productos->nextPageUrl(),
                'prev_page' => $productos->previousPageUrl(),
                'current_page' => $productos->currentPage()
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventario/CrearInventario');
    }

    // Métodos de proveedores comentados - funcionalidad removida
    /*
    public function storeProveedor(Request $request)
    {
        $messages = [
            'nombre.required' => 'El nombre del proveedor es obligatorio.',
            'nombre.unique' => 'Ya existe un proveedor con ese nombre.',
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
        ];

        $request->validate([
            'nombre' => 'required|string|max:255|unique:proveedores,nombre',
            'categoria_id' => 'required|exists:categorias_productos,categoria_id',
        ], $messages);

        Proveedor::create([
            'nombre' => $request->nombre,
            'categoria_id' => $request->categoria_id,
        ]);

        return redirect()->route('inventario')->with('success', 'Producto creado exitosamente.');
    }
    */

    // Simplificado: solo requiere nombre para crear producto
    public function store(Request $request)
    {
        $messages = [
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'stock.integer' => 'La cantidad debe ser un número entero.',
            'stock.min' => 'La cantidad no puede ser negativa.',
            'precio_lista.required' => 'El precio de lista es obligatorio.',
            'precio_lista.numeric' => 'El precio de lista debe ser un número.',
            'precio_lista.min' => 'El precio de lista debe ser mayor o igual a 0.',
            'precio_publico.required' => 'El precio público es obligatorio.',
            'precio_publico.numeric' => 'El precio público debe ser un número.',
            'precio_publico.min' => 'El precio público debe ser mayor o igual a 0.',
        ];

        // Validación simplificada - solo nombre y precios son requeridos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'stock' => 'nullable|integer|min:0',
            'precio_lista' => 'required|numeric|min:0',
            'precio_publico' => 'required|numeric|min:0',
        ], $messages);

        // El código se genera automáticamente en el Observer
        $producto = Producto::create([
            'nombre' => $request->nombre,
            'stock' => $request->stock ?? 0,
            'precio_lista' => $request->precio_lista,
            'precio_publico' => $request->precio_publico,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente.',
            'producto' => $producto
        ], 201);
    }

    // Método de aumento masivo comentado - funcionalidad de proveedores removida
    /*
    public function aumentoMasivo(Request $request)
    {
        // ... (código anterior)
    }
    */
}
