<?php

namespace App\Http\Controllers\Gestion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GestionesController extends Controller
{
    public function show()
    {
        return Inertia::render('Gestion/GestionPage',
            [
                'contador' => 0
            ]
        );
    }
}
