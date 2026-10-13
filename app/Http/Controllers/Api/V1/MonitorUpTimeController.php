<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use App\Models\Ping;
use Illuminate\Http\Request;

class MonitorUpTimeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Monitor $monitor, Request $request)
    {
        

         $since = now()->subHours(24);

         $total = Ping::where('monitor_id', $monitor->id)
                   ->where('checked_at', '>=', $since)
                   ->count();
                   
         $up = Ping::where('monitor_id', $monitor->id)
                 ->where('checked_at', '>=', $since)
                 ->where('status', 'up')
                 ->count();


        return response()->json([
            'status'=> true,
            'message' => "Uptime and ping data fetched successfully !",
            'data' => [
                'monitor_id' => $monitor->id,
                 'uptime_percentage' => $total > 0 ? round(($up / $total) * 100, 2) : null,
                 'total_checks' => $total,
                 'checked_from'      => $since->toISOString(),
                 'checked_to'        => now()->toISOString(),
            ]
        ]);
    }
}
