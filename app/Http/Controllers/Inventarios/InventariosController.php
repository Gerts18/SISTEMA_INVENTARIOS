<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventariosController extends Controller
{

    public function show()
    {
        return Inertia::render('Inventarios/inventario');
    }

    public function catalogo(){
        return Inertia::render('Inventarios/catalogo');
    }
}
