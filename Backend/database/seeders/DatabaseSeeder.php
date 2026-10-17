<?php

namespace Database\Seeders;

use App\Models\Monitor;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            UserSeeder::class,    // 1 lakh users
            MonitorSeeder::class, // medbandhu wala
            LoadTestSeeder::class, // 1000 monitors + 10L pings
        ]);
    }
}
