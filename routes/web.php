<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/load-test', function () {
    return response()->json(['message' => 'API is working', 'status' => 'success']);
});
