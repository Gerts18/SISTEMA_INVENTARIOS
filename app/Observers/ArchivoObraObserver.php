<?php

namespace App\Observers;

use App\Http\Controllers\Files\FilesController;
use App\Models\Obras\ArchivoObra;

class ArchivoObraObserver
{
    /**
     * Se ejecuta cuando un ArchivoObra es eliminado
     */
    public function deleted(ArchivoObra $archivo): void
    {
        $filesController = new FilesController();
        
        if ($archivo->url_archivo) {
            $filesController->eliminarDeS3($archivo->url_archivo);
        }

        if ($archivo->url_thumbnail) {
            $filesController->eliminarDeS3($archivo->url_thumbnail);
        }
    }
}
