<?php

namespace App\Http\Controllers\Obras;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Files\FilesController;
use App\Models\Obras\Obra;
use App\Models\Obras\ArchivoObra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ObrasController extends Controller
{
    public function show()
    {
        $obras = Obra::with('archivos')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Obra/ObrasPage', [
            'obras' => $obras
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'fecha_final' => 'required|date|after_or_equal:today',
        ]);

        //Checa que haya al menos un archivo
        $hasFiles = false;
        for ($i = 0; $i < 3; $i++) {
            if ($request->hasFile("archivo_{$i}")) {
                $hasFiles = true;
                break;
            }
        }

        if (!$hasFiles) {
            return response()->json([
                'success' => false,
                'message' => 'Debe subir al menos un archivo.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Create obra
            $obra = Obra::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'fecha_inicio' => now()->toDateString(),
                'fecha_fin' => $request->fecha_final,
                'estado' => 'en_progreso',
            ]);

            // Clean nombre for folder name (remove special characters)
            $nombreLimpio = preg_replace('/[^a-zA-Z0-9_-]/', '_', $obra->nombre);

            // Upload files
            $filesController = new FilesController();
            for ($i = 0; $i < 3; $i++) {
                if ($request->hasFile("archivo_{$i}")) {
                    $file = $request->file("archivo_{$i}");
                    
                    $fileRequest = new Request();
                    $fileRequest->files->set('archivo', $file);
                    
                    $uploadResult = $filesController->subirArchivoObra(
                        $fileRequest, 
                        $obra->obra_id, 
                        $nombreLimpio
                    );
                    
                    $uploadData = $uploadResult->getData(true);
                    
                    if ($uploadData['success']) {
                        ArchivoObra::create([
                            'obra_id' => $obra->obra_id,
                            'nombre_archivo' => $uploadData['filename'],
                            'url_archivo' => $uploadData['url'],
                        ]);
                    } else {
                        Log::error('Error uploading file for obra ' . $obra->obra_id . ': ' . ($uploadData['error'] ?? 'Unknown error'));
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating obra: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la obra: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $obraId)
    {
        $request->validate([
            'estado' => 'required|string|in:en_progreso,finalizada',
        ]);

        try {
            $obra = Obra::findOrFail($obraId);
            
            // Solo actualizar el estado, sin modificar fechas
            $obra->update(['estado' => $request->estado]);
            
            // Obtener todas las obras actualizadas para devolver a la vista
            $obras = Obra::with('archivos')->orderBy('created_at', 'desc')->get();
            
            return Inertia::render('Obra/ObrasPage', [
                'obras' => $obras
            ])->with('success', 'Estado actualizado correctamente.');

        } catch (\Exception $e) {
            Log::error('Error updating obra status: ' . $e->getMessage());
            
            // En caso de error, devolver a la vista con el error
            $obras = Obra::with('archivos')->orderBy('created_at', 'desc')->get();
            
            return Inertia::render('Obra/ObrasPage', [
                'obras' => $obras
            ])->with('error', 'Error al actualizar el estado: ' . $e->getMessage());
        }
    }

    public function getSolicitudes($obraId)
    {
        try {
            $solicitudes = DB::table('solicitudes_material')
                ->select(
                    'solicitudes_material.solicitud_id',
                    'solicitudes_material.fecha_solicitud',
                    'solicitudes_material.concepto',
                    'solicitudes_material.reporte_generado_url',
                    'solicitudes_material.created_at',
                    'users.name as usuario_name',
                    'users.id as usuario_id'
                )
                ->join('users', 'solicitudes_material.usuario_id', '=', 'users.id')
                ->where('solicitudes_material.obra_id', $obraId)
                ->orderBy('solicitudes_material.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'solicitudes' => $solicitudes
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching solicitudes for obra: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las solicitudes'
            ], 500);
        }
    }
}
  