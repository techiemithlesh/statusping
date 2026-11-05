<?php

namespace App\Services\Checkers\Decorator;

use App\Models\Monitor;
use App\Services\Checkers\CheckerInterface;
use App\Services\Checkers\CheckResult;
use InvalidArgumentException;

class RetryDecorator implements CheckerInterface
{
    public function __construct(
        private CheckerInterface $checker,
        private int $maxAttempts = 3,
    ) {
        if ($maxAttempts < 1) {
            throw new InvalidArgumentException('The maximum number of attempts must be at least 1.');
        }
    }

    public function check(Monitor $monitor): CheckResult
    {
        $result = $this->checker->check($monitor);

        for ($attempt = 1; $attempt < $this->maxAttempts && $result->isDown(); $attempt++) {
            $result = $this->checker->check($monitor);
        }

        return $result;
    }
}
