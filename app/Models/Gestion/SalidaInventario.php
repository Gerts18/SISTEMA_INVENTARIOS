<?php

namespace App\Models\Gestion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SalidaInventario extends Model
{
    protected $table = 'salidas_inventario';
    protected $primaryKey = 'salida_inv_id';
    public $timestamps = true;

    protected $fillable = [
        'usuario_id', 
        'fecha', 
        'imagen_solicitud'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function salidasProducto()
    {
        return $this->hasMany(SalidaProducto::class, 'salida_inv_id', 'salida_inv_id');
    }
}
