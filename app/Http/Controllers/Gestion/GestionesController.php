<?php

namespace App\Http\Controllers\Gestion;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Files\FilesController;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Productos\Producto;
use App\Models\Gestion\GestionInventario;
use App\Models\Gestion\CambioProducto;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
/* use Illuminate\Support\Facades\Storage; */
use Illuminate\Support\Facades\Hash;

use Illuminate\Support\Facades\Log;

class GestionesController extends Controller
{
    public function show()
    {
        return Inertia::render(
            'Gestion/GestionPage',
            []
        );
    }

    public function productoExistencia($codigo)
    {
        $producto = Producto::with(['proveedor.categoria'])
            ->where('codigo', $codigo)
            ->first();

        if (!$producto) {
            return response()->json(['found' => false]);
        }

        $proveedor = $producto->proveedor;
        $categoria = $proveedor && $proveedor->categoria ? $proveedor->categoria->nombre : '';
        $proveedorNombre = $proveedor ? $proveedor->nombre : '';

        return response()->json([
            'found' => true,
            'producto' => [
                'id' => (int) $producto->producto_id,
                'nombre' => $producto->nombre,
                'codigo' => $producto->codigo,
                'stock' => (int) $producto->stock,
                // devolver precios correctos y numéricos
                'precio_lista' => $producto->precio_lista !== null ? (float) $producto->precio_lista : null,
                'precio_publico' => $producto->precio_publico !== null ? (float) $producto->precio_publico : null,
                // mantener compatibilidad con el front
                'categoria' => $categoria,
                'proveedor_nombre' => $proveedorNombre,
                'proveedor_categoria' => $categoria,
            ]
        ]);
    }

    public function verificarCredencialesProduccion(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
        }

        // Verificar que el usuario tenga rol de producción o administrador
        if (!$user->hasAnyRole(['produccion', 'administrador'])) {
            return response()->json(['success' => false, 'message' => 'Usuario sin permisos de producción'], 403);
        }

        return response()->json(['success' => true, 'message' => 'Credenciales verificadas']);
    }

    public function registrarGestion(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:Entrada,Salida',
            'productos' => 'required|string',
            'comprobante' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf,doc,docx|max:10240',
            // Campos opcionales para autenticación de producción
            'auth_email' => 'nullable|email',
            'auth_password' => 'nullable|string',
        ]);

        $usuarioId = Auth::id();
        $tipo = $request->input('tipo');
        $productos = json_decode($request->input('productos'), true);

        if (!$productos || !is_array($productos)) {
            return response()->json(['success' => false, 'message' => 'Productos inválidos'], 400);
        }

        // Verificar si hay productos de madera SOLO para salidas
        $codigosProductos = array_column($productos, 'codigo');
        $productosConMadera = collect();
        
        if ($tipo === 'Salida') {
            $productosConMadera = Producto::with(['proveedor.categoria'])
                ->whereIn('codigo', $codigosProductos)
                ->get()
                ->filter(function ($producto) {
                    return $producto->proveedor && 
                           $producto->proveedor->categoria && 
                           strtolower($producto->proveedor->categoria->nombre) === 'madera';
                });
        }

        // Si hay productos de madera en una SALIDA y el usuario actual no es administrador
        $usuarioActual = User::find(Auth::id());
        if ($tipo === 'Salida' && $productosConMadera->isNotEmpty() && !$usuarioActual->hasRole('Administrador')) {
            // Verificar credenciales de producción
            if (!$request->auth_email || !$request->auth_password) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Se requiere autenticación de producción para gestionar productos de madera'
                ], 400);
            }

            $userProduccion = User::where('email', $request->auth_email)->first();
            if (!$userProduccion || 
                !Hash::check($request->auth_password, $userProduccion->password) ||
                !$userProduccion->hasAnyRole(['Produccion', 'Administrador'])) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Credenciales de producción incorrectas o sin permisos'
                ], 401);
            }
        }

        DB::beginTransaction();
        try {
            $gestion = GestionInventario::create([
                'usuario_id' => $usuarioId,
                'fecha' => now(),
                'tipo_gestion' => $tipo,
                'imagen_comprobante' => null,
            ]);

            // Process products
            foreach ($productos as $prod) {
                $producto = Producto::where('codigo', $prod['codigo'])->lockForUpdate()->first();
                if (!$producto) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
                }

                $cantidad = (int) $prod['cantidadEntrada'];
                if ($tipo === 'Salida') {
                    if ($producto->stock < $cantidad) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => "Stock insuficiente para {$producto->nombre}"], 400);
                    }
                    $producto->stock -= $cantidad;
                } else {
                    $producto->stock += $cantidad;
                }
                $producto->save();

                CambioProducto::create([
                    'gestion_inv_id' => $gestion->gestion_inv_id,
                    'producto_id' => $producto->producto_id,
                    'cantidad' => $cantidad,
                ]);
            }

            // Usar FilesController para manejar el comprobante con ID de gestión
            if ($request->hasFile('comprobante')) {
                $filesController = new FilesController();
                $uploadResult = $filesController->subirArchivo($request, $gestion->gestion_inv_id);
                $uploadData = $uploadResult->getData(true);
                
                if ($uploadData['success']) {
                    $gestion->update(['imagen_comprobante' => $uploadData['url']]);
                } else {
                    Log::error('Error uploading file for management ' . $gestion->gestion_inv_id . ': ' . ($uploadData['error'] ?? 'Unknown error'));
                }
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
