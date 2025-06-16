<?php

namespace App\Models\Gestion;

use App\Models\User;
use App\Models\Gestion\CambioProducto; // Agregar importación
use Illuminate\Database\Eloquent\Model;

class GestionInventario extends Model
{
    protected $table = 'gestion_inventario';
    protected $primaryKey = 'gestion_inv_id';
    public $timestamps = true;

    protected $fillable = [
        'usuario_id', 
        'fecha', 
        'imagen_comprobante',
        'tipo_gestion'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function cambiosProducto() // Corregir nombre del método
    {
        return $this->hasMany(CambioProducto::class, 'gestion_inv_id', 'gestion_inv_id');
    }
}
