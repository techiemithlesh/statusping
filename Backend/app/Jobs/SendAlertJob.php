<?php

namespace App\Jobs;

use App\Models\Incident;
use App\Models\Monitor;
use App\Services\AlertChannelFactory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAlertJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public readonly Monitor $monitor, public readonly Incident $incident, public readonly string   $alertType = 'down')
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
       $filterKey = $this->alertType === 'down'
        ? 'notify_on_down'
        : 'notify_on_recovery';

    $this->monitor->alertChannels
        ->where('active', true)
        ->where($filterKey, true)
        ->each(function ($channel) {
            AlertChannelFactory::make($channel->type)
                ->send($this->monitor, $this->incident, $channel->config);
        });
    }
}
