<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['up', 'down', 'timeout']); // result of this single check
            $table->unsignedSmallInteger('response_time_ms')->nullable();
            $table->unsignedSmallInteger('status_code')->nullable(); // HTTP status code returned
            $table->string('error_message')->nullable();             // e.g. "Connection refused"
            $table->timestamp('checked_at');

            // Index for fast "last N pings for monitor" queries
            $table->index(['monitor_id', 'checked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pings');
    }
};
