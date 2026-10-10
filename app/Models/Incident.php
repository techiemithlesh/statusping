<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'monitor_id',
        'started_at',
        'resolved_at',
        'duration_seconds',
        'cause',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function monitor()
    {
        return $this->belongsTo(Monitor::class);
    }

    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }
}
