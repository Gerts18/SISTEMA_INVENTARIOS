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
        'estado'
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
    public function isAuthorized()
    {
        return $this->estado === 'autorizado';
    }
}
