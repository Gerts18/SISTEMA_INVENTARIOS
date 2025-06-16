<?php

namespace App\Models\Productos;

use App\Models\Gestion\GestionInventario;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'codigo',
        'stock',
        'precio_actual',
        'categoria_id'
    ];

    public static $rules = [
        'nombre' => 'required|string|max:255',
        'codigo' => 'required|string|max:6|unique:productos,codigo',
        'stock' => 'integer|min:0',
        'precio_actual' => 'required|numeric|min:0',
        'categoria_id' => 'required|exists:categorias_productos,categoria_id',
    ];

    public static $rules_update = [
        'stock' => 'required|integer|min:0', 
    ];

    public function categoria()
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_id', 'categoria_id');
    }

    public function preciosHistorial()
    {
        return $this->hasMany(PrecioHistorial::class, 'producto_id', 'producto_id');
    }

    public function gestionProductos()
    {
        return $this->hasMany(GestionInventario::class, 'producto_id', 'producto_id');
    }

    
}
