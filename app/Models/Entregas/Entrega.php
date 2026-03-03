<?php

namespace App\Models\Entregas;

use App\Models\Obras\Obra;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Entrega extends Model
{
    protected $table = 'entregas';
    protected $primaryKey = 'entrega_id';
    public $timestamps = true;

    protected $fillable = [
        'obra_id',
        'creador_id',
        'titulo',
        'descripcion',
        'estado_general',
    ];

    public static $rules = [
        'obra_id' => 'required|exists:obras,obra_id',
        'creador_id' => 'required|exists:users,id',
        'titulo' => 'required|string|max:255',
        'descripcion' => 'nullable|string|max:500',
        'estado_general' => 'required|string|in:en_curso,completado',
    ];

    public function obra()
    {
        return $this->belongsTo(Obra::class, 'obra_id', 'obra_id');
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'creador_id', 'id');
    }

    public function transiciones()
    {
        return $this->hasMany(EntregaTransicion::class, 'entrega_id', 'entrega_id');
    }

    /**
     * Obtiene la transición activa actual (la más reciente).
     */
    public function transicionActual()
    {
        return $this->hasOne(EntregaTransicion::class, 'entrega_id', 'entrega_id')
            ->latestOfMany('transicion_id');
    }
}
