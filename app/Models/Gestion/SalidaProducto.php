<?php

namespace App\Models\Gestion;

use App\Models\Productos\Producto;
use Illuminate\Database\Eloquent\Model;

class SalidaProducto extends Model
{
    protected $table = 'salidas_producto';
    protected $primaryKey = 'salida_producto_id';
    public $timestamps = true;

    protected $fillable = [
        'salida_inv_id', 
        'producto_id', 
        'cantidad'
    ];

    public function salidaInv()
    {
        return $this->belongsTo(SalidaInventario::class, 'salida_inv_id', 'salida_inv_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
