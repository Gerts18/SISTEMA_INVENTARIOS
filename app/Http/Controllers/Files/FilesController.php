<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\S3\S3Client;

class FilesController extends Controller
{
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
