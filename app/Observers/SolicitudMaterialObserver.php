<?php

namespace App\Observers;

use App\Http\Controllers\Files\FilesController;
use App\Models\Solicitudes\SolicitudMaterial;

class SolicitudMaterialObserver
{
    /**
     * Se ejecuta cuando una SolicitudMaterial es eliminada
     */
    public function deleted(SolicitudMaterial $solicitud): void
    {
        if ($solicitud->reporte_generado_url) {
            $filesController = new FilesController();
            $filesController->eliminarDeS3($solicitud->reporte_generado_url);
        }
    }
}
