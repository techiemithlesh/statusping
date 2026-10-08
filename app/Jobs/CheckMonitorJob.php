<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Monitor;
use App\Models\Ping;
use App\Services\Checkers\HttpChecker;
use Illuminate\Support\Facades\Log;

class CheckMonitorJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(private Monitor $monitor)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(HttpChecker $httpChecker): void
    {
        Log::info("Checking monitor: {$this->monitor->name} ({$this->monitor->url})");

        $result = $httpChecker->check($this->monitor);

        $ping = Ping::create([
            'monitor_id'       => $this->monitor->id,
            'status'           => $result->isDown() ? 'down' : 'up',
            'response_time_ms' => $result->responseTimeMs,
            'status_code'      => $result->statusCode,
            'error_message'    => $result->errorMessage,
            'checked_at'       => now(),
        ]);

        Log::info("Ping recorded: Monitor ID {$ping->monitor_id}, Status: {$ping->status}, Response Time: {$ping->response_time_ms} ms, Status Code: {$ping->status_code}, Error Message: {$ping->error_message}");
        
        // Step 3: Monitor update karo
        $this->monitor->update([
            'status'          => $result->isDown() ? 'down' : 'up',
            'last_checked_at' => now(),
        ]);

        Log::info("Monitor updated: ID {$this->monitor->id}, Status: {$this->monitor->status}, Last Checked At: {$this->monitor->last_checked_at}");
    }
}
