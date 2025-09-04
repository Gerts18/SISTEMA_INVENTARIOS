<?php

namespace App\Models\Productos;

use Illuminate\Database\Eloquent\Model;

class PrecioHistorial extends Model
{
    protected $table = 'precios_historial';
    protected $primaryKey = 'historial_id';
    public $timestamps = true;

    protected $fillable = [
        'producto_id', 
        'precio_lista',
        'precio_publico', 
        'fecha_cambio',
        'tipo_cambio'
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
