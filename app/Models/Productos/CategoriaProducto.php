<?php

namespace App\Models\Productos;

use Illuminate\Database\Eloquent\Model;

class CategoriaProducto extends Model
{
    protected $table = 'categorias_productos';
    protected $primaryKey = 'categoria_id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
    ];

    public static $rules = [
        'nombre' => 'required|string|max:255|unique:categorias_productos,nombre',
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_id', 'categoria_id');
    }
}
