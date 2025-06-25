<?php

namespace App\Http\Controllers\Gestion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Productos\Producto;
use App\Models\Gestion\GestionInventario;
use App\Models\Gestion\CambioProducto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

use Aws\S3\S3Client;

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
                'id' => $producto->producto_id,
                'nombre' => $producto->nombre,
                'codigo' => $producto->codigo,
                'stock' => $producto->stock,
                'precio_actual' => $producto->precio_actual,
                'categoria' => $categoria,
                'proveedor_nombre' => $proveedorNombre,
                'proveedor_categoria' => $categoria,
            ]
        ]);
    }

    public function registrarGestion(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:Entrada,Salida',
            'productos' => 'required|array|min:1',
            'productos.*.codigo' => 'required|string|exists:productos,codigo',
            'productos.*.cantidadEntrada' => 'required|integer|min:1',
        ]);

        $usuarioId = Auth::id();
        $tipo = $request->input('tipo');
        $productos = $request->input('productos');

        DB::beginTransaction();
        try {
            $gestion = GestionInventario::create([
                'usuario_id' => $usuarioId,
                'fecha' => now(),
                'tipo_gestion' => $tipo,
                // 'imagen_comprobante' => null, // Si aplica
            ]);

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

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function subirArchivoComprobante(Request $request)
    {
        if (!$request->hasFile('comprobante')) {
            return response()->json(['success' => false], 400);
        }

        try {
            $file = $request->file('comprobante');
            $s3 = new S3Client([
                'version' => 'latest',
                'region' => env('AWS_DEFAULT_REGION'),
                'credentials' => [
                    'key' => env('AWS_ACCESS_KEY_ID'),
                    'secret' => env('AWS_SECRET_ACCESS_KEY'),
                ],
                'http' => [
                    'verify' => false // ⚠️ Solo para desarrollo local
                ]
            ]);

            $result = $s3->putObject([
                'Bucket' => env('AWS_BUCKET'),
                'Key' => 'comprobantes/' . $file->getClientOriginalName(),
                'Body' => fopen($file->getPathname(), 'r'),
                'ACL' => 'private',
            ]);

            return response()->json([
                'success' => true,
                'url' => $result->get('ObjectURL')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage() // Esto revelará el error real
            ], 500);
        }
    }
}
