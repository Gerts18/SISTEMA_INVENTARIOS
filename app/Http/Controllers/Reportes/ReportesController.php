<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Gestion\GestionInventario;
use Carbon\Carbon;

class ReportesController extends Controller
{
    public $contador = 1;

    public function show(Request $request)
    {
        $fecha = $request->get('fecha', Carbon::today()->format('Y-m-d'));
        
        $gestiones = GestionInventario::with([
            'usuario.roles',
            'cambiosProducto.producto'
        ])
        ->whereDate('fecha', $fecha)
        ->orderBy('fecha', 'desc')
        ->get();

        // Obtener las fechas disponibles en el inventario       
        $fechasDisponibles = GestionInventario::selectRaw('DATE(fecha) as fecha')
            ->distinct()
            ->orderBy('fecha', 'desc')
            ->pluck('fecha')
            ->map(function($fecha) {
                return Carbon::parse($fecha)->format('Y-m-d');
            });

        return Inertia::render('Reporte/ReportesPage', [
            'gestiones' => $gestiones,
            'fechaSeleccionada' => $fecha,
            'fechasDisponibles' => $fechasDisponibles
        ]);
    }
}
