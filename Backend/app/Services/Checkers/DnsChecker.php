<?php

namespace App\Services\Checkers;

use App\Models\Monitor;

class DnsChecker implements CheckerInterface
{
    public function check(Monitor $monitor): CheckResult
    {
        $host = parse_url($monitor->url, PHP_URL_HOST);

        if (!is_string($host) || $host === '' || filter_var($host, FILTER_VALIDATE_IP)) {
            return CheckResult::down('DNS monitor URL must include a valid domain name.');
        }

        $start = hrtime(true);
        $records = dns_get_record($host, DNS_A | DNS_AAAA);
        $responseTimeMs = (int) ((hrtime(true) - $start) / 1_000_000);

        if ($records === false || $records === []) {
            return CheckResult::down("No A or AAAA DNS records found for {$host}.", 0, $responseTimeMs);
        }

        return CheckResult::up($responseTimeMs, 0);
    }
}
