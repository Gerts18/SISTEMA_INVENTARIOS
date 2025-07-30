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
        ]);

        // Create the solicitud
        $solicitud = SolicitudMaterial::create([
            'usuario_id' => Auth::id(),
            'obra_id' => $request->obra_id,
            'fecha_solicitud' => $request->fecha_solicitud,
            'concepto' => $request->concepto,
        ]);

        // For now, just return success
        return response()->json([
            'message' => 'Solicitud enviada correctamente',
            'solicitud_id' => $solicitud->solicitud_id
        ]);
    }
}
