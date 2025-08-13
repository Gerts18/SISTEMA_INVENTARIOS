<?php

namespace App\Models\Obras;

use Illuminate\Database\Eloquent\Model;

class ArchivoObra extends Model
{
    protected $table = 'archivos_obra';
    protected $primaryKey = 'archivo_id';
    public $timestamps = true;

    protected $fillable = [
        'obra_id',
        'nombre_archivo',
        'url_archivo',
    ];

    public static $rules = [
        'obra_id' => 'required|exists:obras,obra_id',
        'nombre_archivo' => 'required|string|max:255',
        'url_archivo' => 'required|url',
    ];

    public function obra()
    {
        return $this->belongsTo(Obra::class, 'obra_id', 'obra_id');
    }
}
