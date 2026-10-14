<?php

namespace Database\Factories;

use App\Models\Monitor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Monitor>
 */
class MonitorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'             => fake()->company() . ' Monitor',
            'url'              => 'https://' . fake()->domainName(),
            'protocol'         => fake()->randomElement(['http', 'https']),
            'interval_minutes' => fake()->randomElement([1, 5, 10]),
            'timeout_seconds'  => 30,
            'confirm_failures' => 2,
            'active'           => true,
            'status'           => fake()->randomElement(['up', 'down', 'pending']),
            'uptime_percentage' => fake()->numberBetween(85, 100),
            'avg_response_ms'  => fake()->numberBetween(80, 1500),
            'last_checked_at'  => now()->subMinutes(rand(1, 60)),
            'user_id'          => 1,
            'project_key'      => fake()->unique()->bothify('proj-????-####'),
        ];
    }
}
