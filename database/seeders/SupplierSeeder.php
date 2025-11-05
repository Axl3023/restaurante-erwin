<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        // Algunos fijos
        $fixed = [
            ['company_name' => 'Proveedor Andino SAC',   'contact_name' => 'María Quispe',   'contact_email' => 'contacto@andinosac.com',   'phone' => '+51 999 111 222', 'address' => 'Av. Los Incas 123, Lima'],
            ['company_name' => 'Alimentos Del Sol SRL',  'contact_name' => 'Jorge Pérez',    'contact_email' => 'ventas@delsol.com',        'phone' => '+51 988 222 333', 'address' => 'Jr. Primavera 456, Arequipa'],
            ['company_name' => 'Distribuidora Pacífico', 'contact_name' => 'Lucía Torres',   'contact_email' => 'lucia@pacifico.pe',        'phone' => '+51 977 333 444', 'address' => 'Calle Pacífico 789, Trujillo'],
        ];

        foreach ($fixed as $s) {
            Supplier::firstOrCreate(
                ['company_name' => $s['company_name']],
                $s + ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // Y unos aleatorios
        Supplier::factory()->count(7)->create();
    }
}
