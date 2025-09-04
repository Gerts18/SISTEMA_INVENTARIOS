<?php

namespace App\Http\Controllers\Obras;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Files\FilesController;
use App\Models\Obras\Obra;
use App\Models\Obras\ArchivoObra;
use App\Models\Obras\RegistroObra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ObrasController extends Controller
{
    public function show(Request $request)
    {
        $perPage = $request->get('per_page', 9); // 9 items por página para grid de 3 columnas
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $status = $request->get('status', 'en_progreso');
        
        $query = Obra::with('archivos');
        
        // Aplicar filtros
        if ($status && $status !== 'todas') {
            $query->where('estado', $status);
        }
        
        if ($search) {
            $query->where('nombre', 'like', '%' . $search . '%');
        }
        
        $obras = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return Inertia::render('Obra/ObrasPage', [
            'obras' => $obras,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage
            ]
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
            
            // Mantener los filtros actuales al recargar
            $currentFilters = [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', 'en_progreso'),
                'per_page' => $request->get('per_page', 9),
                'page' => $request->get('page', 1)
            ];
            
            return redirect()->route('obras', $currentFilters)->with('success', 'Estado actualizado correctamente.');

        } catch (\Exception $e) {
            Log::error('Error updating obra status: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Error al actualizar el estado: ' . $e->getMessage());
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

    public function getRegistros($obraId)
    {
        try {
            $registros = RegistroObra::where('obra_id', $obraId)
                ->orderBy('fecha', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'registros' => $registros
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registros for obra: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los registros'
            ], 500);
        }
    }

    public function storeRegistro(Request $request, $obraId)
    {
        $request->validate([
            'fecha' => 'required|date',
            'concepto' => 'required|string|max:100',
        ]);

        try {
            // Verificar que la obra existe
            $obra = Obra::findOrFail($obraId);
            
            $registro = RegistroObra::create([
                'obra_id' => $obraId,
                'fecha' => $request->fecha,
                'concepto' => $request->concepto,
            ]);

            return response()->json([
                'success' => true,
                'registro' => $registro,
                'message' => 'Registro creado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating registro for obra: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el registro'
            ], 500);
        }
    }
}
