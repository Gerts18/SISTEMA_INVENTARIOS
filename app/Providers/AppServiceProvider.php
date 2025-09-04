<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\Productos\Producto;
use App\Observers\ProductoObserver;

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

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }       

    }
}
