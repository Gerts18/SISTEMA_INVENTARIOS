<?php

namespace App\Models\Reportes;

use App\Models\Obras\Obra;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    protected $table = 'reportes';
    
    protected $fillable = [
        'fecha',
        'descripcion',
        'obra_id',
        'usuario_id',
    ];

    public static $rules = [
        'fecha' => 'required|date',
        'descripcion' => 'required|string|max:500',
        'obra_id' => 'required|exists:obras,obra_id',
        'usuario_id' => 'required|exists:users,id',
    ];

    public function obra()
    {
        return $this->belongsTo(Obra::class, 'obra_id', 'obra_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id');
    }
}
