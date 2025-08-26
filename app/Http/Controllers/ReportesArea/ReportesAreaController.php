<?php

namespace App\Http\Controllers\ReportesArea;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportesAreaController extends Controller
{
    public function show()
    {
        return Inertia::render('ReporteArea/ReportesAreaPage');
    }
}
