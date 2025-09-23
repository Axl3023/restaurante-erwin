<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Customer::updateOrCreate(
            [
                'doc_type'   => 'dni',
                'doc_number' => '47654321', // único
            ],
            [
                'name'    => 'Juan Pérez',
                'email'   => 'juan.perez@example.com',
                'phone'   => '987654321',
                'address' => 'Av. Siempre Viva 742, Lima',
            ]
        );
    }
}
