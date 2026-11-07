<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MonitorController;
use App\Http\Controllers\Api\V1\MonitorUpTimeController;
use Illuminate\Support\Facades\Route;


Route::get('/load-test', function () {
    return response()->json(['message' => 'API is working', 'status' => 'success']);
});

Route::get('/health', function () {
    return response()->json(['message' => 'API is healthy', 'status' => 'success']);
});


Route::prefix('v1')->name('api.v1.')->group(function(){
    Route::get('/monitors/{monitor}/uptime', MonitorUptimeController::class);
    Route::apiResource('monitors', MonitorController::class);
});

Route::get('/users', [AuthController::class, 'index']);
Route::post('/auth/create', [AuthController::class, 'create']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::delete('/users/{user}', [AuthController::class, 'deleteUser'])->middleware('auth:sanctum');
