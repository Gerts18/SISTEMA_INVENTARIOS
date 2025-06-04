<?php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Inventarios\InventariosController;
use App\Http\Controllers\Gestion\GestionesController;

//Ruta general
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('inicio');
    }
    return redirect()->route('login');
})->name('home');

//Rutas accesibles solo por usuarios autenticados
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('inicio', function () {
        return Inertia::render('InicioPage');
    })->name('inicio');

    //Rutas de inventario
    Route::group( ['prefix' => 'inventario','middleware' => ['role:Administrador|Diseño|Bodega']], function (){

        Route::get('/',[InventariosController::class, 'show'])->name('inventario');

    });

    Route::group( ['prefix' => 'gestion','middleware' => ['role:Administrador|Bodega']], function (){

        Route::get('/',[GestionesController::class, 'show'])->name('gestion');

    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
