<?php

namespace App\Services\Channels;

use App\Models\Incident;
use App\Models\Monitor;

class DiscordChannel implements AlertChannelInterface
{
    public function send(Monitor $monitor, Incident $incident, array $config): void
    {
        echo "Sending alert to Discord for monitor: {$monitor->name}, incident: {$incident->id}\n";
    }
}
