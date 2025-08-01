<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use App\Models\Obras\Obra;
use App\Models\Solicitudes\SolicitudMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SolicitarMaterialController extends Controller
{
    public function index()
    {
        return inertia('Inventario/SolicitarMaterial');
    }

    public function getObras()
    {
        $obras = Obra::select('obra_id', 'nombre')
                    ->where('estado', 'en_progreso')
                    ->orderBy('nombre')
                    ->get();
        
        return response()->json($obras);
    }

    public function store(Request $request)
    {
        $request->validate([
            'obra_id' => 'required|exists:obras,obra_id',
            'concepto' => 'required|string|max:500',
            'fecha_solicitud' => 'required|date',
            'herraje' => 'nullable|string',
            'barniz' => 'nullable|string',
            'madera' => 'nullable|string',
            'equipos' => 'nullable|string',
            'pdf_url' => 'nullable|url',
        ]);

        // Create the solicitud
         $solicitud = SolicitudMaterial::create([
            'usuario_id' => Auth::id(),
            'obra_id' => $request->obra_id,
            'fecha_solicitud' => $request->fecha_solicitud,
            'concepto' => $request->concepto,
            'reporte_generado_url' => $request->pdf_url,
        ]); 

        return response()->json([
            'message' => 'Solicitud enviada correctamente',
            'solicitud_id' => $solicitud->solicitud_id 
        ]);
    }

    public function updatePdfUrl(Request $request, $solicitudId)
    {
        $request->validate([
            'pdf_url' => 'required|url',
        ]);

        $solicitud = SolicitudMaterial::findOrFail($solicitudId);
        $solicitud->reporte_generado_url = $request->pdf_url;
        $solicitud->save();

        return response()->json([
            'message' => 'PDF URL actualizada correctamente'
        ]);
    }

    public function getSolicitudes()
    {
        $solicitudes = SolicitudMaterial::with(['obra:obra_id,nombre', 'usuarioPideMaterial:id,name'])
            ->select('solicitud_id', 'usuario_id', 'obra_id', 'fecha_solicitud', 'concepto', 'reporte_generado_url', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($solicitud) {
                return [
                    'solicitud_id' => $solicitud->solicitud_id,
                    'fecha_solicitud' => $solicitud->fecha_solicitud,
                    'concepto' => $solicitud->concepto,
                    'reporte_generado_url' => $solicitud->reporte_generado_url,
                    'created_at' => $solicitud->created_at,
                    'obra' => [
                        'obra_id' => $solicitud->obra->obra_id,
                        'nombre' => $solicitud->obra->nombre,
                    ],
                    'usuario' => [
                        'id' => $solicitud->usuarioPideMaterial->id,
                        'name' => $solicitud->usuarioPideMaterial->name,
                        'roles' => $solicitud->usuarioPideMaterial->getRoleNames(),
                    ],
                ];
            });

        return response()->json($solicitudes);
    }

    public function indexSolicitudes()
    {
        return inertia('Inventario/SolicitudesDeMaterial');
    }
}
