<?php

namespace App\Models\Obras;

use App\Models\Solicitudes\SolicitudMaterial;
use Illuminate\Database\Eloquent\Model;

class Obra extends Model
{
    protected $table = 'obras';
    protected $primaryKey = 'obra_id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
    ];

    public static $rules = [
        'nombre' => 'required|string|max:255',
        'descripcion' => 'nullable|string|max:500',
        'fecha_inicio' => 'required|date',
    ];

    public function solicitudes()
    {
        return $this->hasMany(SolicitudMaterial::class, 'obra_id', 'obra_id');
    }

    public function archivos()
    {
        return $this->hasMany(ArchivoObra::class, 'obra_id', 'obra_id');
    }
}
