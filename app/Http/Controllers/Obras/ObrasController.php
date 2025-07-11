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
        return Inertia::render('Obra/ObrasPage');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:500',
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
                'fecha_fin' => null,
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
}
