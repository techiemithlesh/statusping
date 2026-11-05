<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertLogs extends Model
{
    protected $fillable = [
        'monitor_id',
        'type',
        'config',
        'notify_on_down',
        'notify_on_recovery',
        'active',
    ];

    protected $casts = [
        'type' => 'enum:App\Enums\AlertType',
    ];

    public function monitor()
    {
        return $this->belongsTo(Monitor::class);
    }
}
