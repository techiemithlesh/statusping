<?php

use App\Services\Checkers\CheckResult;

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



