<?php

use App\Models\Monitor;
use App\Services\Checkers\CheckerInterface;
use App\Services\Checkers\CheckResult;
use App\Services\Checkers\Decorator\LoggingCheckerDecorator;
use App\Services\Checkers\Decorator\RetryDecorator;
use Illuminate\Support\Facades\Log;

test('retry decorator retries down results until a check succeeds', function () {
    $monitor = new Monitor(['url' => 'https://medbandhu.com']);
    $checker = Mockery::mock(CheckerInterface::class);
    $checker->shouldReceive('check')
        ->with($monitor)
        ->times(3)
        ->andReturn(
            CheckResult::down('Temporary failure'),
            CheckResult::down('Temporary failure'),
            CheckResult::up(42, 200),
        );

    $result = (new RetryDecorator($checker))->check($monitor);

    expect($result->isUp)->toBeTrue();
    expect($result->responseTimeMs)->toBe(42);
});

test('retry decorator stops after the configured maximum attempts', function () {
    $monitor = new Monitor(['url' => 'https://medbandhu.com']);
    $checker = Mockery::mock(CheckerInterface::class);
    $checker->shouldReceive('check')
        ->with($monitor)
        ->times(2)
        ->andReturn(CheckResult::down('Still unavailable'));

    $result = (new RetryDecorator($checker, 2))->check($monitor);

    expect($result->isDown())->toBeTrue();
    expect($result->errorMessage)->toBe('Still unavailable');
});

test('retry decorator rejects a maximum attempt count below one', function () {
    expect(fn () => new RetryDecorator(Mockery::mock(CheckerInterface::class), 0))
        ->toThrow(InvalidArgumentException::class);
});

test('logging decorator logs and returns the wrapped checker result', function () {
    $monitor = new Monitor(['url' => 'https://medbandhu.com']);
    $result = CheckResult::down('Service unavailable', 503, 125);
    $checker = Mockery::mock(CheckerInterface::class);
    $checker->shouldReceive('check')->once()->with($monitor)->andReturn($result);

    Log::shouldReceive('info')
        ->once()
        ->with('Monitor check result', [
            'monitor_id' => $monitor->id,
            'is_up' => false,
            'response_time_ms' => 125,
            'status_code' => 503,
            'error_message' => 'Service unavailable',
        ]);

    expect((new LoggingCheckerDecorator($checker))->check($monitor))->toBe($result);
});
