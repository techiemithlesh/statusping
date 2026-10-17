<?php

namespace App\Services;

use App\Services\Channels\AlertChannelInterface;
use App\Services\Channels\EmailChannel;
use App\Services\Channels\SlackChannel;
use InvalidArgumentException;

class AlertChannelFactory
{
    /**
     * Create a new class instance.
     */

    // WHEN WE CREATE ANY FUNCTION STATIC THEN WE CAN DIRECTLY CALL THE OBJECT METHOD WITHOUT PASSING INSIDE THE CONSTRUCTOR;

    public static function make(string $channel): AlertChannelInterface
    {
       return match($channel){
          'email' => new EmailChannel(),
          'slack' => new SlackChannel(),
           default   => throw new InvalidArgumentException(
                "Unknown alert channel: {$channel}"
            ), 
        };
    }
}
