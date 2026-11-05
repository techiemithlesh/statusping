<?php

namespace App\Console\Commands;

use App\Jobs\CheckMonitorJob;
use App\Models\Monitor;
use Illuminate\Console\Command;

class DispatchMonitorChecks extends Command
{
    protected $signature = 'monitors:dispatch';

    protected $description = 'Dispatch checks for active monitors that are due';

    public function handle(): int
    {
        $now = now();

        $dueMonitors = Monitor::query()
            ->where('active', true)
            ->get()
            ->filter(function (Monitor $monitor) use ($now): bool {
                if ($monitor->last_checked_at === null) {
                    return true;
                }

                return $monitor->last_checked_at
                    ->copy()
                    ->addMinutes($monitor->interval_minutes)
                    ->lte($now);
            });

        $dueMonitors->each(fn (Monitor $monitor) => CheckMonitorJob::dispatch($monitor));

        $this->info("Dispatched checks for {$dueMonitors->count()} monitor(s).");

        return self::SUCCESS;
    }
}
