<?php

namespace Database\Seeders;

use App\Models\Supply;
use Illuminate\Database\Seeder;

class SupplySeeder extends Seeder
{
    public function run(): void
    {
        // Catálogo base
        $base = [
            ['name' => 'Arroz',        'unit_measure' => 'kg',    'unit_price' => 4.20],
            ['name' => 'Azúcar',       'unit_measure' => 'kg',    'unit_price' => 3.80],
            ['name' => 'Harina',       'unit_measure' => 'kg',    'unit_price' => 3.50],
            ['name' => 'Aceite',       'unit_measure' => 'l',     'unit_price' => 9.90],
            ['name' => 'Leche',        'unit_measure' => 'unidad', 'unit_price' => 3.00],
            ['name' => 'Huevos',       'unit_measure' => 'unidad', 'unit_price' => 0.80],
            ['name' => 'Sal',          'unit_measure' => 'kg',    'unit_price' => 2.00],
            ['name' => 'Pimienta',     'unit_measure' => 'g',     'unit_price' => 0.05],
            ['name' => 'Papas',        'unit_measure' => 'kg',    'unit_price' => 2.20],
            ['name' => 'Cebolla',      'unit_measure' => 'kg',    'unit_price' => 2.10],
            ['name' => 'Tomate',       'unit_measure' => 'kg',    'unit_price' => 3.40],
            ['name' => 'Pollo',        'unit_measure' => 'kg',    'unit_price' => 11.50],
            ['name' => 'Carne Res',    'unit_measure' => 'kg',    'unit_price' => 18.90],
            ['name' => 'Queso',        'unit_measure' => 'kg',    'unit_price' => 16.00],
            ['name' => 'Jamón',        'unit_measure' => 'kg',    'unit_price' => 22.00],
        ];

        foreach ($base as $b) {
            Supply::firstOrCreate(
                ['name' => $b['name']],
                $b + ['stock' => 0, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // Y algunos aleatorios extra
        Supply::factory()->count(10)->create();
    }
}
