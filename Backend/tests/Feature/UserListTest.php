<?php

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    $this->originalDatabase = config('database.default');
    $this->originalRedisDriver = config('cache.stores.redis.driver');
    config([
        'database.default' => 'sqlite',
        'database.connections.sqlite.database' => ':memory:',
    ]);
    DB::purge();

    config(['cache.stores.redis.driver' => 'array']);
    Cache::store('redis')->flush();

    Schema::dropIfExists('users');
    Schema::create('users', function (Blueprint $table): void {
        $table->id();
        $table->string('role_id')->default('user');
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->rememberToken();
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('users');
    Cache::store('redis')->flush();
    DB::purge('sqlite');
    config(['database.default' => $this->originalDatabase]);
    config(['cache.stores.redis.driver' => $this->originalRedisDriver]);
});

test('users can be searched and paginated', function () {
    User::factory()->create(['name' => 'Alice Example', 'email' => 'alice@example.com']);
    User::factory()->create(['name' => 'Alice Other', 'email' => 'other@example.com']);
    User::factory()->create(['name' => 'Bob Example', 'email' => 'bob@example.com']);

    $response = $this->getJson('/api/users?search=alice&page=2&per_page=1')
        ->assertOk()
        ->assertJsonPath('data.current_page', 2)
        ->assertJsonPath('data.per_page', 1)
        ->assertJsonPath('data.total', 2)
        ->assertJsonPath('data.data.0.email', 'alice@example.com');

    $links = collect($response->json('data.links'))->pluck('url')->filter()->implode(' ');
    expect($links)->toContain('search=alice')->toContain('per_page=1');
});

test('user list results are cached for ten minutes', function () {
    User::factory()->create(['name' => 'Alice Example', 'email' => 'alice@example.com']);

    $this->getJson('/api/users?search=alice')
        ->assertOk()
        ->assertJsonPath('data.total', 1);

    User::factory()->create(['name' => 'Alice Other', 'email' => 'other@example.com']);

    $this->getJson('/api/users?search=alice')
        ->assertOk()
        ->assertJsonPath('data.total', 1);

    $this->travel(11)->minutes();

    $this->getJson('/api/users?search=alice')
        ->assertOk()
        ->assertJsonPath('data.total', 2);
});

test('invalid pagination parameters are rejected', function () {
    $this->getJson('/api/users?per_page=101')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('per_page');
});
