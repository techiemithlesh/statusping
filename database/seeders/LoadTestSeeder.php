<?php

namespace Database\Seeders;

use App\Models\Monitor;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoadTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $this->command->info('Creating 1000 monitors...');
        Monitor::factory()->count(1000)->create(['user_id' => $user->id]);

        $monitorIds = Monitor::pluck('id')->toArray();
        $this->command->info('✅ Monitors done: ' . count($monitorIds));

        $total     = 1_000_000;
        $chunkSize = 10_000;
        $inserted  = 0;

        $this->command->getOutput()->progressStart($total);

        while ($inserted < $total) {
            $rows = [];

            for ($i = 0; $i < $chunkSize; $i++) {
                $rand = rand(1, 100);

                // 85% up, 10% down, 5% timeout
                if ($rand <= 85) {
                    $status      = 'up';
                    $responseMs  = rand(80, 2000);
                    $statusCode  = 200;
                    $errorMsg    = null;
                } elseif ($rand <= 95) {
                    $status      = 'down';
                    $responseMs  = null;
                    $statusCode  = fake()->randomElement([500, 503, 404]);
                    $errorMsg    = fake()->randomElement([
                        'Connection refused',
                        'Service unavailable',
                        '500 Internal Server Error',
                    ]);
                } else {
                    $status      = 'timeout';
                    $responseMs  = null;
                    $statusCode  = null;
                    $errorMsg    = 'Request timed out after 30s';
                }

                $checkedAt = now()->subSeconds(rand(0, 15_552_000)); // ~6 months

                $rows[] = [
                    'monitor_id'      => $monitorIds[array_rand($monitorIds)],
                    'status'          => $status,
                    'response_time_ms'=> $responseMs,
                    'status_code'     => $statusCode,
                    'error_message'   => $errorMsg,
                    'checked_at'      => $checkedAt,
                ];
            }

            DB::table('pings')->insert($rows);
            $inserted += $chunkSize;
            $this->command->getOutput()->progressAdvance($chunkSize);
        }

        $this->command->getOutput()->progressFinish();
        $this->command->info('✅ 10 lakh pings inserted!');
    }
}
