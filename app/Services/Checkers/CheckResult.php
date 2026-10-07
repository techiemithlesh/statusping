<?php

namespace App\Services\Checkers;

readonly class CheckResult
{
    public function __construct(
        public bool $isUp,
        public int $responseTimeMs,
        public int $statusCode,
        public string $errorMessage = '',
    ) {}

    public function isDown() : bool 
    {
        return !$this->isUp;
    }

    public static function up(int $responseTimeMs, int $statusCode): self
    {
        return new self(true, $responseTimeMs, $statusCode);
    }

    public static function down(string $errorMessage, int $statusCode = 0): self
    {
        return new self(false, 0, $statusCode, $errorMessage);
    }
}
