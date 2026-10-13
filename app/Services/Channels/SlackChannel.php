<?php

namespace App\Services\Channels;

use App\Models\Monitor;
use App\Models\Incident;
use Illuminate\Support\Facades\Log;
use Override;

class SlackChannel implements AlertChannelInterface
{
    
    public function send(Monitor $monitor, Incident $incident): void
    {
        Log::info("Slack Channel Called");
    }
}
