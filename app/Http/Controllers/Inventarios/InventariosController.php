<?php

namespace App\Http\Controllers\Inventarios;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventariosController extends Controller
{

    public $contador = 1;

    public function show()
    {
        return Inertia::render('Inventario/InventarioPage',
            [
                'contador' => $this->contador
            ]
        );
    }

    public function catalogo(){
        return Inertia::render('Inventario/CatalogoInventario');
    }
}
