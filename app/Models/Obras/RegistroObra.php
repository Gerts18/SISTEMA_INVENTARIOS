<?php

namespace App\Models\Obras;

use Illuminate\Database\Eloquent\Model;

class RegistroObra extends Model
{
    protected $table = 'registro_obras';

    protected $fillable = [
        'obra_id',
        'fecha',
        'concepto',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function obra()
    {
        return $this->belongsTo(Obra::class, 'obra_id', 'obra_id');
    }
}
