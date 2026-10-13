<?php

namespace App\Services\Channels;

use App\Mail\MonitorDownMail;
use App\Models\Monitor;
use App\Models\Incident;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailChannel implements AlertChannelInterface
{
    public function send(Monitor $monitor, Incident $incident, array $config): void
    {
        Mail::to($config['address'])
        ->send(new MonitorDownMail($monitor, $incident));
    }
}