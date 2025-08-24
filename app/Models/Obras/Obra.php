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
        'fecha_fin',
        'estado',
    ];

    public static $rules = [
        'nombre' => 'required|string|max:255',
        'descripcion' => 'nullable|string|max:500',
        'fecha_inicio' => 'required|date',
        'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        'estado' => 'required|string|max:50|in:en_progreso,finalizada',
    ];

    public function solicitudes()
    {
        return $this->hasMany(SolicitudMaterial::class, 'obra_id', 'obra_id');
    }

    public function archivos()
    {
        return $this->hasMany(ArchivoObra::class, 'obra_id', 'obra_id');
    }

    public function registros()
    {
        return $this->hasMany(RegistroObra::class, 'obra_id', 'obra_id');
    }
}
