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
    ];


    protected static function newFactory()
    {
        return \Database\Factories\ProductoFactory::new();
    }

    public static $rules = [
        'nombre' => 'required|string|max:255',
        'stock' => 'integer|min:0',
        'precio_lista' => 'required|numeric|min:0',
        'precio_publico' => 'required|numeric|min:0',
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

    // Relación comentada - proveedor removido
    // public function proveedor()
    // {
    //     return $this->belongsTo(Proveedor::class, 'proveedor_id', 'proveedor_id');
    // }

    /**
     * Generar el siguiente código incremental para productos
     */
    public static function generarCodigoIncremental(): string
    {
        $ultimoProducto = self::orderBy('producto_id', 'desc')->first();

        if (!$ultimoProducto) {
            return '000001';
        }

        // Obtener el código actual y convertirlo a entero
        $ultimoCodigo = (int) $ultimoProducto->codigo;
        $nuevoCodigo = $ultimoCodigo + 1;

        // Formatear con ceros a la izquierda (6 dígitos)
        return str_pad($nuevoCodigo, 6, '0', STR_PAD_LEFT);
    }
}
