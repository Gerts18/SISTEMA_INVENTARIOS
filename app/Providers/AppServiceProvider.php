<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\Productos\Producto;
use App\Observers\ProductoObserver;
use App\Models\Obras\ArchivoObra;
use App\Observers\ArchivoObraObserver;
use App\Models\Obras\Obra;
use App\Observers\ObraObserver;
use App\Models\Gestion\GestionInventario;
use App\Observers\GestionInventarioObserver;
use App\Models\Solicitudes\SolicitudMaterial;
use App\Observers\SolicitudMaterialObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar el Observer para el modelo Producto
        Producto::observe(ProductoObserver::class);

        // Registrar Observers para limpieza automática de huérfanos en S3
        ArchivoObra::observe(ArchivoObraObserver::class);
        Obra::observe(ObraObserver::class);
        GestionInventario::observe(GestionInventarioObserver::class);
        SolicitudMaterial::observe(SolicitudMaterialObserver::class);

        // Forzar HTTPS en producción
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }       

    }
}
