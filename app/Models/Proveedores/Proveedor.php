<?php

namespace App\Models\Proveedores;

use App\Models\Productos\CategoriaProducto;
use App\Models\Productos\Producto;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table = 'proveedores';
    protected $primaryKey = 'proveedor_id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'categoria_id',
    ];

    public static $rules = [
        'nombre' => 'required|string|max:255|unique:proveedores,nombre',
        'categoria_id' => 'required|exists:categorias_proveedores,categoria_id',
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'proveedor_id', 'proveedor_id');
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_id', 'categoria_id');
    }
}
