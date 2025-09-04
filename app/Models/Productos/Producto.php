<?php

namespace App\Models\Productos;

use App\Models\Gestion\GestionInventario;
use App\Models\Proveedores\Proveedor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;
    
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'codigo',
        'stock',
        'precio_lista',
        'precio_publico',
        'proveedor_id',
    ];
    
 
    protected static function newFactory()
    {
        return \Database\Factories\ProductoFactory::new();
    }

    public static $rules = [
        'nombre' => 'required|string|max:255',
        'codigo' => 'required|string|max:6|unique:productos,codigo',
        'stock' => 'integer|min:0',
        'precio_lista' => 'required|numeric|min:0',
        'precio_publico' => 'required|numeric|min:0',
        'proveedor_id' => 'required|exists:proveedores,proveedor_id',
    ];

    public static $rules_update = [
        'stock' => 'required|integer|min:0', 
    ];

    public function preciosHistorial()
    {
        return $this->hasMany(PrecioHistorial::class, 'producto_id', 'producto_id');
    }

    public function gestionProductos()
    {
        return $this->hasMany(GestionInventario::class, 'producto_id', 'producto_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id', 'proveedor_id');
    }
    
}
