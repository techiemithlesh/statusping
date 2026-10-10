<?php

namespace App\Listeners;

use App\Events\MonitorDownEvent;
use App\Events\MonitorUpEvent;
use App\Models\Incident;
use App\Models\Monitor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class IncidentWatcher implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    private $downEvent;
    private $upEvent;

    use InteractsWithQueue;

    public function __construct()
    {
        
    }

    /**
     * Handle the event.
     */
    public function handle(Object $event): void
    {
        $monitor = $event->monitor;

        if ($event instanceof MonitorDownEvent) {
            $this->handleDown($monitor);
        } elseif ($event instanceof MonitorUpEvent) {
            $this->handleUp($monitor);
        }
    }

    
    private function handleDown(Monitor $monitor) : void
    {
        $alreadyDown = Incident::where('monitor_id', $monitor->id)->where('status', 'ongoing')->exists();

        if($alreadyDown) {
            return;
        }

        Incident::create([
            'monitor_id' => $monitor->id,
            'started_at' => now(),
            'status' => 'ongoing',
        ]);
    }

    private function handleUp(Monitor $monitor) : void {
        
       Incident::where('monitor_id', $monitor->id)
            ->where('status', 'ongoing')
            ->update(['status' => 'resolved', 'resolved_at' => now()]);
        
    }
}
