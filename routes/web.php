<?php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Inventarios\InventariosController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    //Rutas de inventarios
    Route::group( ['prefix' => 'inventarios','middleware' => ['role:Administrador']], function (){

        Route::get('/',[InventariosController::class, 'show'])->name('inventarios');

    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
