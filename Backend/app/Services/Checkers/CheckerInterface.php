<?php

namespace App\Services\Checkers;

use App\Models\Monitor;

interface CheckerInterface
{
    public function check(Monitor $monitor): CheckResult;
}
