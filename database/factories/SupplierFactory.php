<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_name' => $this->faker->unique()->company(),
            'contact_name' => $this->faker->name(),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'phone'        => $this->faker->e164PhoneNumber(),
            'address'      => $this->faker->address(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ];
    }
}
