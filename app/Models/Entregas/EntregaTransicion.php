<?php

namespace App\Models\Entregas;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class EntregaTransicion extends Model
{
    protected $table = 'entrega_transiciones';
    protected $primaryKey = 'transicion_id';
    public $timestamps = true;

    protected $fillable = [
        'entrega_id',
        'remitente_id',
        'destinatario_id',
        'estado',
        'comentario',
        'fecha',
        'es_devolucion',
    ];

    protected $casts = [
        'es_devolucion' => 'boolean',
        'fecha' => 'date',
    ];

    public static $rules = [
        'entrega_id' => 'required|exists:entregas,entrega_id',
        'remitente_id' => 'required|exists:users,id',
        'destinatario_id' => 'required|exists:users,id',
        'estado' => 'required|string|in:no_recibido,recibido,faltante',
        'comentario' => 'nullable|string|max:1000',
        'fecha' => 'required|date',
        'es_devolucion' => 'boolean',
    ];

    public function entrega()
    {
        return $this->belongsTo(Entrega::class, 'entrega_id', 'entrega_id');
    }

    public function remitente()
    {
        return $this->belongsTo(User::class, 'remitente_id', 'id');
    }

    public function destinatario()
    {
        return $this->belongsTo(User::class, 'destinatario_id', 'id');
    }
}
