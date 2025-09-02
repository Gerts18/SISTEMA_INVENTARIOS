<?php

namespace App\Models\Autorizacion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Autorizaciones extends Model
{
    protected $table = 'autorizaciones';

    protected $fillable = [
        'usuario_id',
        'concepto',
        'fecha',
        'autorizado'
    ];

    protected $casts = [
        'fecha' => 'date',
        'autorizado' => 'boolean'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
