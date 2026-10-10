<?php

namespace App\Providers;

use App\Events\MonitorDownEvent;
use App\Events\MonitorUpEvent;
use App\Listeners\IncidentWatcher;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Event::listen(
            MonitorDownEvent::class,
            IncidentWatcher::class
        );

        Event::listen(
            MonitorUpEvent::class,
            IncidentWatcher::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
