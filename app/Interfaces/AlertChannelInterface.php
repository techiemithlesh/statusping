<?php

namespace App\Interfaces;

use App\Models\Monitor;

interface AlertChannelInterface
{
    public function send(Monitor $monitor, string $message): void;

    public function channelName(): string;
}
