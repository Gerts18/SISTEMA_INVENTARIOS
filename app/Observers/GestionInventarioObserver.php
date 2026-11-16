<?php

namespace App\Observers;

use App\Http\Controllers\Files\FilesController;
use App\Models\Gestion\GestionInventario;

class GestionInventarioObserver
{
    /**
     * Se ejecuta cuando una GestionInventario es eliminada
     */
    public function deleted(GestionInventario $gestion): void
    {
        $filesController = new FilesController();

        if ($gestion->imagen_comprobante) {
            $filesController->eliminarDeS3($gestion->imagen_comprobante);
        }

        if ($gestion->imagen_comprobante_thumb) {
            $filesController->eliminarDeS3($gestion->imagen_comprobante_thumb);
        }
    }
}
