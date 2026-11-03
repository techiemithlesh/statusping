<?php

namespace App\Services\Checkers;

use App\Models\Monitor;

class TcpChecker implements CheckerInterface
{
    public function check(Monitor $monitor): CheckResult
    {
        $host = parse_url($monitor->url, PHP_URL_HOST);
        $port = parse_url($monitor->url, PHP_URL_PORT);
        $scheme = parse_url($monitor->url, PHP_URL_SCHEME);

        if (!is_string($host) || $host === '') {
            return CheckResult::down('TCP monitor URL must include a valid host.');
        }

        if ($port === null) {
            $port = match ($scheme) {
                'http' => 80,
                'https' => 443,
                default => null,
            };
        }

        if (!is_int($port) || $port < 1 || $port > 65535) {
            return CheckResult::down('TCP monitor URL must include a valid port.');
        }

        $start = hrtime(true);
        $connection = @stream_socket_client(
            "tcp://{$host}:{$port}",
            $errorCode,
            $errorMessage,
            $monitor->timeout_seconds,
            STREAM_CLIENT_CONNECT
        );

        if ($connection === false) {
            return CheckResult::down($errorMessage ?: "TCP connection failed with error code {$errorCode}.");
        }

        fclose($connection);

        $responseTimeMs = (int) ((hrtime(true) - $start) / 1_000_000);

        return CheckResult::up($responseTimeMs, 0);
    }
}
