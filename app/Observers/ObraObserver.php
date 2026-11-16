<?php

namespace App\Observers;

use App\Models\Obras\Obra;

class ObraObserver
{
    /**
     * Se ejecuta antes o cuando una Obra es eliminada para asegurar que sus archivos se limpien de S3
     */
    public function deleting(Obra $obra): void
    {
        // Forzar el disparo del evento delete en cada ArchivoObra para que su observer limpie S3
        foreach ($obra->archivos as $archivo) {
            $archivo->delete();
        }
    }
}
