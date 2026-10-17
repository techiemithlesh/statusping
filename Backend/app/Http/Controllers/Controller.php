<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Statusping an uptime Monitoring tool',
    description: 'API Documentation for statusping',
    contact: new OA\Contact(email: 'techie.mithlesh@gmail.com'),
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    description: 'Statusping API',
)]
abstract class Controller
{
    //
}
