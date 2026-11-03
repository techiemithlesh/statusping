<?php

use App\Models\Monitor;
use App\Services\Checkers\CheckResult;
use App\Services\Checkers\CheckerFactory;
use App\Services\Checkers\CheckerInterface;
use App\Services\Checkers\DnsChecker;
use App\Services\Checkers\HttpChecker;
use App\Services\Checkers\TcpChecker;
use Illuminate\Support\Facades\Http;

test('Up Result has correct values', function(){
    $result = CheckResult::up(100, 200);

    expect($result->isUp)->toBeTrue();
    expect($result->responseTimeMs)->toEqual(100);
    expect($result->statusCode)->toEqual(200);
    expect($result->errorMessage)->toEqual('');
});

test('Down Result has correct values', function(){
    $result = CheckResult::down('Error message', 500);

    expect($result->isUp)->toBeFalse();
    expect($result->responseTimeMs)->toEqual(0);
    expect($result->statusCode)->toEqual(500);
    expect($result->errorMessage)->toEqual('Error message');
});

test('HTTP and HTTPS protocols use the HTTP checker strategy', function () {
    expect(CheckerFactory::make('http'))->toBeInstanceOf(HttpChecker::class);
    expect(CheckerFactory::make('https'))->toBeInstanceOf(HttpChecker::class);
});

test('checker strategy can be used through its interface', function () {
    Http::fake([
        '*' => Http::response('OK', 200),
    ]);

    $checker = CheckerFactory::make('https');
    $result = $checker->check(new Monitor(['url' => 'https://example.com']));

    expect($checker)->toBeInstanceOf(CheckerInterface::class);
    expect($result->isUp)->toBeTrue();
    expect($result->statusCode)->toBe(200);
});

test('TCP protocol uses the TCP checker strategy', function () {
    expect(CheckerFactory::make('tcp'))->toBeInstanceOf(TcpChecker::class);
});

test('DNS protocol uses the DNS checker strategy', function () {
    expect(CheckerFactory::make('dns'))->toBeInstanceOf(DnsChecker::class);
});

test('DNS checker rejects URLs without a domain name', function () {
    $result = (new DnsChecker())->check(new Monitor(['url' => 'https://127.0.0.1']));

    expect($result->isDown())->toBeTrue();
    expect($result->errorMessage)->toBe('DNS monitor URL must include a valid domain name.');
});

test('unknown monitor protocols are rejected', function () {
    CheckerFactory::make('icmp');
})->throws(\InvalidArgumentException::class, 'Unknown monitor protocol: icmp');
