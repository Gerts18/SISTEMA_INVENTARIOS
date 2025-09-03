<?php

use App\Http\Controllers\Files\FilesController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Inventarios\InventariosController;
use App\Http\Controllers\Inventarios\SolicitarMaterialController;
use App\Http\Controllers\Gestion\GestionesController;
use App\Http\Controllers\Obras\ObrasController;
use App\Http\Controllers\Reportes\ReportesController;
use App\Http\Controllers\Productos\ProductosController;


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
        Route::post('/create',[InventariosController::class, 'store'])->name('inventario.store');
        Route::post('/createProveedor',[InventariosController::class, 'storeProveedor'])->name('inventario.storeProveedor');
        Route::get('/catalogo',[InventariosController::class, 'catalogo'])->name('inventario.catalogo');
        Route::get('/productos-proveedor/{proveedor_id}', [InventariosController::class, 'productosPorProveedor'])->name('inventario.productosPorProveedor');
        Route::get('/proveedores', [InventariosController::class, 'showProveedores'])->name('inventario.proveedores');
        Route::get('/productos/{categoria_id}', [InventariosController::class, 'productosPorCategoria']);
        Route::get('/buscar/{codigo}', [InventariosController::class, 'buscarPorCodigo'])->name('inventario.buscar');
        
        // Ruta para actualización masiva de precios
        Route::post('/actualizar-precios-masivo', [InventariosController::class, 'aumentoMasivo'])->name('inventario.actualizar-precios-masivo');
        
        // Solicitar Material routes
        Route::get('/solicitar-material', [SolicitarMaterialController::class, 'index'])->name('inventario.solicitar-material');
        Route::get('/solicitar-material/obras', [SolicitarMaterialController::class, 'getObras'])->name('inventario.solicitar-material.obras');
        Route::post('/solicitar-material', [SolicitarMaterialController::class, 'store'])->name('inventario.solicitar-material.store');
        Route::put('/solicitar-material/{solicitudId}/pdf-url', [SolicitarMaterialController::class, 'updatePdfUrl']);
        
        // Solicitudes de Material routes
        Route::get('/solicitudes-material', [SolicitarMaterialController::class, 'indexSolicitudes'])->name('inventario.solicitudes-material');
        Route::get('/solicitudes-material/data', [SolicitarMaterialController::class, 'getSolicitudes'])->name('inventario.solicitudes-material.data');

        // Rutas para productos
        Route::post('/productos', [ProductosController::class, 'store'])->name('productos.store');
        Route::patch('/productos/{id}', [ProductosController::class, 'update'])->name('productos.update');
        Route::get('/productos/{id}/historial-precios', [ProductosController::class, 'obtenerHistorialPrecios'])->name('productos.historial-precios');

    });

    Route::post('/files/solicitud-material/{solicitudId}/{obraId}/{nombreObra}', [FilesController::class, 'subirPDFSolicitudMaterial'])->middleware(['auth', 'verified']);

    //Rutas para la gestión de inventario (Entradas y Salidas de productos)
    Route::group(['prefix' => 'gestion', 'middleware' => ['role:Administrador|Bodega']], function () {

        Route::get('/', [GestionesController::class, 'show'])->name('gestion');
        
        Route::get('/producto-existencia/{codigo}', [GestionesController::class, 'productoExistencia']);

        Route::post('/registrar', [GestionesController::class, 'registrarGestion']);
    
    });

    //Reportes de inventario
    Route::group(['prefix' => 'reportes', 'middleware' => ['role:Administrador']], function () {

        Route::get('/', [ReportesController::class, 'show'])->name('reportes');

    });

    //Reportes de inventario
    Route::group(['prefix' => 'obras', 'middleware' => ['role:Administrador|Diseño']], function () {

        Route::get('/', [ObrasController::class, 'show'])->name('obras');
        Route::post('/create', [ObrasController::class, 'store'])->name('obras.store');
        Route::patch('/{obra}/status', [ObrasController::class, 'updateStatus'])->name('obras.updateStatus');
        Route::get('/{obra}/solicitudes', [ObrasController::class, 'getSolicitudes'])->name('obras.solicitudes');

    });


});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
