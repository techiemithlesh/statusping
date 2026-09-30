<?php

namespace Database\Seeders;

use App\Models\Monitor;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MonitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        Monitor::create([
            'name' => 'Medbandhu',
            'url' => 'https://medbandhu.com/',
            'user_id' => $user->id,
            'protocol' => 'https',
            'interval_minutes' => 5,
            'timeout_seconds' => 30,
            'active' => true,
            'status' => 'pending',
        ]);
    }
}
