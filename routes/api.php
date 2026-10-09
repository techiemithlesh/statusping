<?php
use Illuminate\Support\Facades\Route;


Route::get('/load-test', function () {
    return response()->json(['message' => 'API is working', 'status' => 'success']);
});

Route::get('/health', function () {
    return response()->json(['message' => 'API is healthy', 'status' => 'success']);
});