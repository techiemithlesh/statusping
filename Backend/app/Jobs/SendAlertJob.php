<?php

namespace App\Jobs;

use App\Models\AlertLogs;
use App\Models\Incident;
use App\Models\Monitor;
use App\Services\Channels\AlertChannelFactory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SendAlertJob implements ShouldQueue
{
    use Queueable;
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly Monitor $monitor,
        public readonly Incident $incident,
        public readonly string $event = 'down', // 'down' or 'recovery'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $filterKey = $this->event === 'down' ? 'notify_on_down' : 'notify_on_recovery';

        $channels = $this->monitor->alertChannels()
            ->where('active', true)
            ->where($filterKey, true)
            ->get();

        foreach ($channels as $channel) {
            $log = AlertLogs::firstOrCreate(
                [
                    'alert_channel_id' => $channel->id,
                    'incident_id'      => $this->incident->id,
                    'event'            => $this->event,
                ],
                ['status' => 'retrying', 'attempts' => 0],
            );

           
            if ($log->status === 'sent') {
                continue;
            }

            try {
                AlertChannelFactory::make($channel->type)
                    ->send($this->monitor, $this->incident, $channel->config);

                $log->update([
                    'status'   => 'sent',
                    'attempts' => $log->attempts + 1,
                ]);
            } catch (Throwable $e) {
                $log->update([
                    'status'        => 'failed',
                    'attempts'      => $log->attempts + 1,
                    'error_message' => $e->getMessage()
                ]);
            }
        }
    }
}
