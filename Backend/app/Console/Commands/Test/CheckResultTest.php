<?php

namespace App\Console\Commands\Test;

use App\Models\Monitor;
use App\Services\Checkers\HttpChecker;
use Illuminate\Console\Command;

class CheckResultTest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sp:check-result {url}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test HttpChecker against a URL';

    /**
     * Execute the console command.
     */
    public function handle(HttpChecker $checker): void
    {
        $url = $this->argument('url');

         $monitor = new Monitor(['url' => $this->argument('url')]);
         $result  = $checker->check($monitor);

         $this->table(
            ['Field', 'Value'],
            [
                ['Status',      $result->isUp ? '✅ UP' : '🔴 DOWN'],
                ['Response MS', $result->responseTimeMs],
                ['Status Code', $result->statusCode],
                ['Error',       $result->errorMessage ?: '-'],
            ]
        );
    }
}
