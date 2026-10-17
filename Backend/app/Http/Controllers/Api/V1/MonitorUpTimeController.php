<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use App\Models\Ping;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MonitorUpTimeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    #[OA\Get(
        path: '/api/v1/monitors/{monitor}/uptime',
        summary: 'Get monitor uptime for the last 24 hours',
        tags: ['Monitors'],
        parameters: [
            new OA\Parameter(
                name: 'monitor',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
        ],
        responses: [new OA\Response(response: 200, description: 'Uptime information')],
    )]
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
