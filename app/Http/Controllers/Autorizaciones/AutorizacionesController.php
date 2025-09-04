<?php

namespace App\Http\Controllers\Autorizaciones;

use App\Http\Controllers\Controller;
use App\Models\Autorizacion\Autorizaciones;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AutorizacionesController extends Controller
{
    public function show()
    {
        // Obtener todas las autorizaciones ordenadas por fecha descendente (más reciente primero)
        $todasLasAutorizaciones = Autorizaciones::with('usuario')
            ->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        $misAutorizaciones = Autorizaciones::with('usuario')
            ->where('usuario_id', Auth::id())
            ->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Autorizacion/AutorizacionesPage', [
            'autorizaciones' => $misAutorizaciones,
            'todasLasAutorizaciones' => $todasLasAutorizaciones
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'concepto' => 'required|string|max:200'
        ], [
            'concepto.required' => 'El concepto es obligatorio.',
            'concepto.max' => 'El concepto no puede exceder los 200 caracteres.'
        ]);

        Autorizaciones::create([
            'usuario_id' => Auth::id(),
            'concepto' => $request->concepto,
            'fecha' => now(),
            'estado' => 'pendiente'
        ]);

        return redirect()->route('autorizaciones')->with('message', 'Autorización enviada correctamente.');
    }

    public function updateStatus(Request $request, Autorizaciones $autorizacion)
    {
        $request->validate([
            'estado' => 'required|string|in:autorizado,rechazado'
        ]);

        $autorizacion->update([
            'estado' => $request->estado
        ]);

        $message = $request->estado === 'autorizado' ? 'Autorización aprobada correctamente.' : 'Autorización rechazada correctamente.';
        
        return redirect()->back()->with('message', $message);
    }
}
