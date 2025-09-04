<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'Administrador']);
        Role::firstOrCreate(['name' => 'Bodega']);
        Role::firstOrCreate(['name' => 'Diseño']);
        Role::firstOrCreate(['name' => 'Empleado']);
        Role::firstOrCreate(['name' => 'Produccion']);
        Role::firstOrCreate(['name' => 'Instalacion']);
        Role::firstOrCreate(['name' => 'Barniz']);
        Role::firstOrCreate(['name' => 'Checador']);
        Role::firstOrCreate(['name' => 'Contador']);
    }
}
