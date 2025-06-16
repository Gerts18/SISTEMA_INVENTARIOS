<?php

namespace App\Models\Gestion;

use App\Models\Productos\Producto;
use App\Models\Gestion\GestionInventario; // Agregar importación
use Illuminate\Database\Eloquent\Model;

class CambioProducto extends Model
{
    protected $table = 'cambios_producto';
    protected $primaryKey = 'cambio_producto_id';
    public $timestamps = true;
    
    protected $fillable = [
        'gestion_inv_id', 
        'producto_id', 
        'cantidad'
    ];

    public function entradaInventario()
    {
        return $this->belongsTo(GestionInventario::class, 'gestion_inv_id', 'gestion_inv_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
