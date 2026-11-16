<?php

namespace App\Http\Controllers\Telemetry;

use App\Http\Controllers\Controller;
use App\Models\Gestion\GestionInventario;
use App\Models\Obras\ArchivoObra;
use App\Models\Solicitudes\SolicitudMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TelemetryController extends Controller
{
    /**
     * Registra un clic/consulta asíncrona a un archivo
     */
    public function trackClick(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:archivo_obra,gestion,solicitud',
            'id' => 'required|integer',
        ]);

        try {
            $type = $validated['type'];
            $id = $validated['id'];

            if ($type === 'archivo_obra') {
                ArchivoObra::where('archivo_id', $id)->increment('clics_count');
            } elseif ($type === 'gestion') {
                GestionInventario::where('gestion_inv_id', $id)->increment('clics_count');
            } elseif ($type === 'solicitud') {
                SolicitudMaterial::where('solicitud_id', $id)->increment('clics_count');
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Devuelve las estadísticas totales y agregadas de consultas/clics
     */
    public function getStats()
    {
        try {
            $archivosObrasClics = (int) DB::table('archivos_obra')->sum('clics_count');
            $gestionesClics = (int) DB::table('gestion_inventario')->sum('clics_count');
            $solicitudesClics = (int) DB::table('solicitudes_material')->sum('clics_count');
            $totalClics = $archivosObrasClics + $gestionesClics + $solicitudesClics;

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_clics' => $totalClics,
                    'archivos_obras_clics' => $archivosObrasClics,
                    'gestiones_clics' => $gestionesClics,
                    'solicitudes_clics' => $solicitudesClics,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
