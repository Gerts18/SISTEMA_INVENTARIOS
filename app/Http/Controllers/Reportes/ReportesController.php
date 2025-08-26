<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Gestion\GestionInventario;
use App\Models\Reportes\Reporte;
use Carbon\Carbon;

/*
Este controlador se encarga de renderizar las GESTIONES DE INVENTARIO en forma de reporte.
Las Gestiones de Inventario son registros de todas las entradas y salidas de productos en el sistema y se hacen desde el módulo de gestión.

Tambien se encarga de renderizar los REPORTES DE AREA.

*/

class ReportesController extends Controller
{
    public $contador = 1;

    public function show(Request $request)
    {
        $fecha = $request->get('fecha', Carbon::today()->format('Y-m-d'));
        
        // Gestiones de inventario
        $gestiones = GestionInventario::with([
            'usuario.roles',
            'cambiosProducto.producto'
        ])
        ->whereDate('fecha', $fecha)
        ->orderBy('fecha', 'desc')
        ->orderBy('created_at', 'desc')
        ->get();

        // Reportes de área
        $reportes = Reporte::with([
            'usuario.roles',
            'obra'
        ])
        ->whereDate('fecha', $fecha)
        ->orderBy('fecha', 'desc')
        ->orderBy('created_at', 'desc')
        ->get();

        // Obtener las fechas disponibles de ambas tablas
        $fechasGestiones = GestionInventario::selectRaw('DATE(fecha) as fecha')
            ->distinct()
            ->pluck('fecha');
            
        $fechasReportes = Reporte::selectRaw('DATE(fecha) as fecha')
            ->distinct()
            ->pluck('fecha');

        $fechasDisponibles = $fechasGestiones->merge($fechasReportes)
            ->unique()
            ->sort()
            ->reverse()
            ->values()
            ->map(function($fecha) {
                return Carbon::parse($fecha)->format('Y-m-d');
            });

        return Inertia::render('Reporte/ReportesPage', [
            'gestiones' => $gestiones,
            'reportes' => $reportes,
            'fechaSeleccionada' => $fecha,
            'fechasDisponibles' => $fechasDisponibles
        ]);
    }
}
