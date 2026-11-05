<?php

namespace App\Services\Checkers\Decorator;

use App\Models\Monitor;
use App\Services\Checkers\CheckerInterface;
use App\Services\Checkers\CheckResult;

class LoggingCheckerDecorator implements CheckerInterface
{
    public function __construct(private CheckerInterface $checker) {}

    public function check(Monitor $monitor): CheckResult
    {
        $result = $this->checker->check($monitor);

        logger()->info('Monitor check result', [
            'monitor_id' => $monitor->id,
            'is_up' => $result->isUp,
            'response_time_ms' => $result->responseTimeMs,
            'status_code' => $result->statusCode,
            'error_message' => $result->errorMessage,
        ]);

        return $result;
    }
}
