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
        Schema::create('alert_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['slack', 'email', 'webhook']);
            $table->json('config');  // {"webhook_url":"..."} or {"email":"..."} or {"url":"...","secret":"..."}
            $table->boolean('notify_on_down')->default(true);
            $table->boolean('notify_on_recovery')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_channels');
    }
};
