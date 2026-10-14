<?php

namespace Database\Factories;

use App\Models\Monitor;
use App\Models\Ping;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ping>
 */
class PingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'monitor_id'       => Monitor::inRandomOrder()->value('id'),
            'status'           => fake()->randomElement(['up', 'up', 'up', 'down', 'timeout']),
            'response_time_ms' => fake()->numberBetween(80, 2000),
            'status_code'      => 200,
            'error_message'    => null,
            'checked_at'       => fake()->dateTimeBetween('-6 months', now()),
        ];
    }
}
