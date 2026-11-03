<?php

namespace App\Services\Checkers;

use InvalidArgumentException;

class CheckerFactory
{
    public static function make(string $protocol): CheckerInterface
    {
        return match ($protocol) {
            'http', 'https' => new HttpChecker(),
            'tcp' => new TcpChecker(),
            'dns' => new DnsChecker(),
            default => throw new InvalidArgumentException("Unknown monitor protocol: {$protocol}"),
        };
    }
}
