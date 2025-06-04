<?php

namespace App\Models\Gestion;

use App\Models\Productos\Producto;
use Illuminate\Database\Eloquent\Model;

class EntradaProducto extends Model
{
    protected $table = 'entradas_producto';
    protected $primaryKey = 'entrada_producto_id';
    public $timestamps = true;
    
    protected $fillable = [
        'entrada_inv_id', 
        'producto_id', 
        'cantidad'
    ];

    public function entradaInventario()
    {
        return $this->belongsTo(EntradaInventario::class, 'entrada_inv_id', 'entrada_inv_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
