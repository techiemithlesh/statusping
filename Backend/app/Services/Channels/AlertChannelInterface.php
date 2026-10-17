<?php

namespace App\Services\Channels;

use App\Models\Monitor;
use App\Models\Incident;

interface AlertChannelInterface
{
    public function send(Monitor $monitor, Incident $incident, array $config): void;
}