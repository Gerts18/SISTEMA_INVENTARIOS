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
            'productos' => 'required|string',
            'comprobante' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf,doc,docx|max:10240',
        ]);

        $usuarioId = Auth::id();
        $tipo = $request->input('tipo');
        $productos = json_decode($request->input('productos'), true);

        if (!$productos || !is_array($productos)) {
            return response()->json(['success' => false, 'message' => 'Productos inválidos'], 400);
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

            // Usar la función subirArchivo para manejar el comprobante con ID de gestión
            if ($request->hasFile('comprobante')) {
                $uploadResult = $this->subirArchivo($request, $gestion->gestion_inv_id);
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

    public function subirArchivo(Request $request, $gestionId = null)
    {
        if (!$request->hasFile('comprobante')) {
            return response()->json(['success' => false], 400);
        }

        try {
            $file = $request->file('comprobante');
            
            // Generar nombre de archivo específico según si tiene gestionId
            if ($gestionId) {
                $fecha = now()->format('Y-m-d_H-i-s');
                $fileName = "comprobante_{$gestionId}_{$fecha}." . $file->getClientOriginalExtension();
            } else {
                $fileName = time() . '_' . $file->getClientOriginalName();
            }
            
            $mimeType = $file->getMimeType();

            $s3 = new S3Client([
                'version' => 'latest',
                'region' => env('AWS_DEFAULT_REGION'),
                'credentials' => [
                    'key' => env('AWS_ACCESS_KEY_ID'),
                    'secret' => env('AWS_SECRET_ACCESS_KEY'),
                ],
                'http' => [
                    'verify' => env('APP_ENV') === 'local' 
                            ? false
                            : true
                ]
            ]);

            $result = $s3->putObject([
                'Bucket' => env('AWS_BUCKET'),
                'Key' => 'comprobantes/' . $fileName,
                'Body' => fopen($file->getPathname(), 'r'),
                'ContentType' => $mimeType,
                'ContentDisposition' => 'inline',
                'CacheControl' => 'max-age=31536000',
            ]);

            // Genera la URL pública del archivo
            $publicUrl = sprintf(
                'https://%s.s3.%s.amazonaws.com/%s',
                env('AWS_BUCKET'),
                env('AWS_DEFAULT_REGION'),
                'comprobantes/' . $fileName
            );

            return response()->json([
                'success' => true,
                'url' => $publicUrl
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
