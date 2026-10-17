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
        Schema::create('monitors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->enum('protocol', ['http', 'https', 'tcp'])->default('https');
            $table->unsignedSmallInteger('interval_minutes')->default(1); // check every N minutes
            $table->unsignedSmallInteger('timeout_seconds')->default(10);
            $table->unsignedSmallInteger('confirm_failures')->default(2); // confirm before alerting
            $table->boolean('active')->default(true);
            $table->enum('status', ['up', 'down', 'paused', 'pending'])->default('pending');
            $table->unsignedInteger('uptime_percentage')->nullable(); // 0-100
            $table->unsignedSmallInteger('avg_response_ms')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('project_key')->unique()->nullable();  
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitors');
    }
};
