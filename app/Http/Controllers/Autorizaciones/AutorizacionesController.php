<?php

namespace App\Http\Controllers\Autorizaciones;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AutorizacionesController extends Controller
{
    public function show()
    {
        return Inertia::render('Autorizacion/AutorizacionesPage');
    }

}
