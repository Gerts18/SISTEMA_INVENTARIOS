<?php

namespace App\Models\Gestion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class EntradaInventario extends Model
{
    protected $table = 'entradas_inventario';
    protected $primaryKey = 'entrada_inv_id';
    public $timestamps = true;

    protected $fillable = [
        'usuario_id', 
        'fecha', 
        'imagen_comprobante'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function entradasProducto()
    {
        return $this->hasMany(EntradaProducto::class, 'entrada_inv_id', 'entrada_inv_id');
    }
}
