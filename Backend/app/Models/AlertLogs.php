<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertLogs extends Model
{
    protected $fillable = [
        'alert_channel_id',
        'incident_id',
        'event',
        'status',
        'attempts',
        'error_message',
    ];

    

    protected $casts = [
        'event' => 'enum:down,up',
    ];

    public function alertChannel()
    {
        return $this->belongsTo(AlertChannel::class);
    }
    
    public function monitor()
    {
        return $this->belongsTo(Monitor::class);
    }
}
