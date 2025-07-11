<?php

namespace App\Models\Solicitudes;

use App\Models\Obras\Obra;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SolicitudMaterial extends Model
{
    protected $table = 'solicitudes_material';
    protected $primaryKey = 'solicitud_id';
    public $timestamps = true;

    protected $fillable = [
        'usuario_id',
        'obra_id',
        'fecha_solicitud',
        'concepto',
        'reporte_generado_url'
    ];

    public static $rules = [
        'usuario_id' => 'required|exists:users,id',
        'obra_id' => 'required|exists:obras,obra_id',
        'fecha_solicitud' => 'required|date',
        'concepto' => 'required|string|max:500',
        'reporte_generado_url' => 'nullable|url|max:255'
    ];

    public function obra()
    {
        return $this->belongsTo(Obra::class, 'obra_id', 'obra_id');
    }

    public function usuarioPideMaterial()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id');
    }
    
}
