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
        $autorizaciones = Autorizaciones::with('usuario')
            ->where('usuario_id', Auth::id())
            ->orderBy('fecha', 'desc')
            ->get();

        return Inertia::render('Autorizacion/AutorizacionesPage', [
            'autorizaciones' => $autorizaciones
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
            'autorizado' => false
        ]);

        return redirect()->route('autorizaciones')->with('message', 'Autorización enviada correctamente.');
    }

    public function updateStatus(Request $request, Autorizaciones $autorizacion)
    {
        $request->validate([
            'autorizado' => 'required|boolean'
        ]);

        $autorizacion->update([
            'autorizado' => $request->autorizado
        ]);

        return redirect()->back()->with('message', 'Estado de autorización actualizado.');
    }
}
