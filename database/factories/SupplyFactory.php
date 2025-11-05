<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyFactory extends Factory
{
    public function definition(): array
    {
        $units = ['kg', 'g', 'l', 'ml', 'unidad', 'paquete', 'caja'];

        return [
            'name'         => ucfirst($this->faker->unique()->words(2, true)),
            'stock'        => $this->faker->numberBetween(0, 200),
            'unit_price'   => $this->faker->randomFloat(2, 0.5, 120),
            'unit_measure' => $this->faker->randomElement($units),
            'created_at'   => now(),
            'updated_at'   => now(),
        ];
    }
}
