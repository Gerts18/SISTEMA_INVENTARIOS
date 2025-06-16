<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Gestion\GestionInventario;

class ReportesController extends Controller
{
    public $contador = 1;

    public function show()
    {
        $gestiones = GestionInventario::with([
            'usuario.roles', // Asumiendo relación roles en User
            'cambiosProducto.producto'
        ])->orderBy('fecha', 'desc')->get();

        return Inertia::render('Reporte/ReportesPage', [
            'gestiones' => $gestiones
        ]);
    }
}
