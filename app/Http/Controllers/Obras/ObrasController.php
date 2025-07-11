<?php

namespace App\Http\Controllers\Obras;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ObrasController extends Controller
{
     public function show()
    {
        return Inertia::render('Obra/ObrasPage');
    }
}
