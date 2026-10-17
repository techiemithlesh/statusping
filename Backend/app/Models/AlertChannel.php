<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlertChannel extends Model
{
    use HasFactory;

    protected $casts = ['config' => 'array'];

    protected $fillable = [
        'monitor_id',
        'type',
        'config',
        'notify_on_down',
        'notify_on_recovery',
        'active',
    ];

    public function monitor(){
        return $this->belongsTo(Monitor::class);
    }
}
