<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;

class FilesController extends Controller
{
    /**
     * Instancia y devuelve el cliente oficial de AWS S3
     */
    private function getS3Client(): S3Client
    {
        return new S3Client([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
            'http' => [
                'verify' => env('APP_ENV') === 'local' ? false : true
            ]
        ]);
    }

    /**
     * Extrae el Key de S3 a partir de la URL pública
     */
    public function extractKeyFromUrl(?string $url): ?string
    {
        if (!$url) return null;

        $bucket = env('AWS_BUCKET');
        $region = env('AWS_DEFAULT_REGION');

        // Formatos habituales de S3:
        // https://bucket.s3.region.amazonaws.com/key
        // https://bucket.s3.amazonaws.com/key
        // https://s3.region.amazonaws.com/bucket/key
        $patterns = [
            "#https://{$bucket}\.s3[.-]{$region}\.amazonaws\.com/(.+)#i",
            "#https://{$bucket}\.s3\.amazonaws\.com/(.+)#i",
            "#https://s3[.-]{$region}\.amazonaws\.com/{$bucket}/(.+)#i",
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        // Si no coincide con los patrones exactos, extraer todo tras el host
        $parsed = parse_url($url, PHP_URL_PATH);
        if ($parsed) {
            $path = ltrim($parsed, '/');
            if (str_starts_with($path, $bucket . '/')) {
                return substr($path, strlen($bucket) + 1);
            }
            return $path;
        }

        return null;
    }

    /**
     * Elimina un objeto de S3 a partir de su URL pública
     */
    public function eliminarDeS3(?string $url): bool
    {
        if (!$url) return true;

        $key = $this->extractKeyFromUrl($url);
        if (!$key) return false;

        try {
            $s3 = $this->getS3Client();
            $s3->deleteObject([
                'Bucket' => env('AWS_BUCKET'),
                'Key' => $key,
            ]);
            Log::info("Archivo eliminado de S3 con éxito: {$key}");
            return true;
        } catch (\Exception $e) {
            Log::error("Error al eliminar archivo de S3 ({$key}): " . $e->getMessage());
            return false;
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
            $s3 = $this->getS3Client();

            // Subir archivo original
            $s3->putObject([
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

            // Subir miniatura opcional si viene en la petición
            $thumbnailUrl = null;
            if ($request->hasFile('comprobante_thumb')) {
                $thumbFile = $request->file('comprobante_thumb');
                $thumbName = "thumb_" . pathinfo($fileName, PATHINFO_FILENAME) . ".jpg";
                
                $s3->putObject([
                    'Bucket' => env('AWS_BUCKET'),
                    'Key' => 'comprobantes/' . $thumbName,
                    'Body' => fopen($thumbFile->getPathname(), 'r'),
                    'ContentType' => 'image/jpeg',
                    'ContentDisposition' => 'inline',
                    'CacheControl' => 'max-age=31536000',
                ]);

                $thumbnailUrl = sprintf(
                    'https://%s.s3.%s.amazonaws.com/%s',
                    env('AWS_BUCKET'),
                    env('AWS_DEFAULT_REGION'),
                    'comprobantes/' . $thumbName
                );
            }

            return response()->json([
                'success' => true,
                'url' => $publicUrl,
                'thumbnail_url' => $thumbnailUrl
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function subirArchivoObra(Request $request, $obraId, $nombreObra)
    {
        if (!$request->hasFile('archivo')) {
            return response()->json(['success' => false], 400);
        }

        try {
            $file = $request->file('archivo');
            
            $fecha = now()->format('Y-m-d_H-i-s');
            $extension = $file->getClientOriginalExtension();
            $nombreOriginal = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            
            // Crear nombre de archivo único: fecha_obraId_nombreOriginal.extension
            $fileName = "{$fecha}_{$obraId}_{$nombreOriginal}.{$extension}";
            
            // Crear ruta de carpeta: obras/obraId_nombreObra/
            $folderPath = "obras/{$obraId}_{$nombreObra}/";
            $mimeType = $file->getMimeType();
            $s3 = $this->getS3Client();

            // Subir archivo original
            $s3->putObject([
                'Bucket' => env('AWS_BUCKET'),
                'Key' => $folderPath . $fileName,
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
                $folderPath . $fileName
            );

            // Subir miniatura opcional si viene en la petición
            $thumbnailUrl = null;
            if ($request->hasFile('archivo_thumb')) {
                $thumbFile = $request->file('archivo_thumb');
                $thumbName = "thumb_" . pathinfo($fileName, PATHINFO_FILENAME) . ".jpg";
                
                $s3->putObject([
                    'Bucket' => env('AWS_BUCKET'),
                    'Key' => $folderPath . $thumbName,
                    'Body' => fopen($thumbFile->getPathname(), 'r'),
                    'ContentType' => 'image/jpeg',
                    'ContentDisposition' => 'inline',
                    'CacheControl' => 'max-age=31536000',
                ]);

                $thumbnailUrl = sprintf(
                    'https://%s.s3.%s.amazonaws.com/%s',
                    env('AWS_BUCKET'),
                    env('AWS_DEFAULT_REGION'),
                    $folderPath . $thumbName
                );
            }

            return response()->json([
                'success' => true,
                'url' => $publicUrl,
                'thumbnail_url' => $thumbnailUrl,
                'filename' => $fileName
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function subirPDFSolicitudMaterial(Request $request, $solicitudId, $obraId, $nombreObra)
    {
        if (!$request->hasFile('pdf')) {
            return response()->json(['success' => false, 'message' => 'No PDF file provided'], 400);
        }

        try {
            $file = $request->file('pdf');
            $fecha = now()->format('Y-m-d_H-i-s');
            
            // Crear nombre de archivo: solicitudId_solicitud_material_fecha.pdf
            $fileName = "{$solicitudId}_solicitud_material_{$fecha}.pdf";
            
            // Crear ruta de carpeta: solicitudes_material/obraId_nombreObra/
            $folderPath = "solicitudes_material/{$obraId}_{$nombreObra}/";
            $s3 = $this->getS3Client();

            $s3->putObject([
                'Bucket' => env('AWS_BUCKET'),
                'Key' => $folderPath . $fileName,
                'Body' => fopen($file->getPathname(), 'r'),
                'ContentType' => 'application/pdf',
                'ContentDisposition' => 'inline',
                'CacheControl' => 'max-age=31536000',
            ]);

            // Genera la URL pública del archivo
            $publicUrl = sprintf(
                'https://%s.s3.%s.amazonaws.com/%s',
                env('AWS_BUCKET'),
                env('AWS_DEFAULT_REGION'),
                $folderPath . $fileName
            );

            return response()->json([
                'success' => true,
                'url' => $publicUrl,
                'filename' => $fileName
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
