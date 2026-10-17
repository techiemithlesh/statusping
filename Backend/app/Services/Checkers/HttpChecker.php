<?php

namespace App\Services\Checkers;
use App\Services\Checkers\CheckResult;

use App\Models\Monitor;
use Illuminate\Support\Facades\Http;

class HttpChecker
{
    private const TIMEOUT_SECONDS = 10;
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        
    }

    public function check(Monitor $monitor) : CheckResult
    {
        $start = hrtime(true);
        try{
            $response = Http::timeout(self::TIMEOUT_SECONDS)->get($monitor->url);

            $ms = (int) ((  hrtime(true) - $start) / 1_000_000);

            if($response->successful() || $response->redirect()){
                return CheckResult::up($ms, $response->status());
            } else {
                return CheckResult::down($response->body(), $response->status());

            }
        } catch(\Exception $e){
            return CheckResult::down($e->getMessage());
        }
    }

}
