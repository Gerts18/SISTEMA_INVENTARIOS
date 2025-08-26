<?php

namespace App\Http\Controllers\ReportesArea;

use App\Http\Controllers\Controller;
use App\Models\Obras\Obra;
use App\Models\Reportes\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/*
    Este controlador se encarga de crear los REPORTES DE AREA.
*/

class ReportesAreaController extends Controller
{
    public function show()
    {
        return Inertia::render('ReporteArea/ReportesAreaPage');
    }

    public function getObras()
    {
        $obras = Obra::select('obra_id', 'nombre', 'estado')->get();
        return response()->json($obras);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'descripcion' => 'required|string|max:500',
            'obra_id' => 'required|exists:obras,obra_id',
        ], [
            'obra_id.required' => 'Debe seleccionar una obra',
            'obra_id.exists' => 'La obra seleccionada no es válida',
            'descripcion.required' => 'La descripción es obligatoria',
            'descripcion.max' => 'La descripción no puede exceder 500 caracteres',
            'fecha.required' => 'La fecha es obligatoria',
            'fecha.date' => 'La fecha debe ser válida',
        ]);

        $reporte = Reporte::create([
            'fecha' => $request->fecha,
            'descripcion' => $request->descripcion,
            'obra_id' => $request->obra_id,
            'usuario_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Reporte creado exitosamente',
            'reporte' => $reporte
        ], 201);
    }
}
