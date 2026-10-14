<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use Illuminate\Http\Request;

class MonitorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $monitors = Monitor::latest()->paginate(10);

        return response()->json([
            'status' => true,
            'message' => "Monitor data feteched successfully !",
            'data' => $monitors
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'url' => 'required|url',
            'protocol' => 'required|in:http,https,tcp'
        ]);

        $validated['user_id']     = auth()->id() ?? 1;
        $validated['project_key'] = 'proj-' . substr(str_shuffle('abcdefghijklmnop'), 0, 4) . '-' . rand(1000, 9999);

        $monitor = Monitor::create($validated);

        return response()->json([
            'status' => true,
            'message' => "Url is registered for monitoring",
            'data' => $monitor
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Monitor $monitor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Monitor $monitor)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Monitor $monitor)
    {
        //
    }
}
