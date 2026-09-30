<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Monitor extends Model
{
    
    use HasFactory;

    protected $fillable = ['name', 'url', 'protocol', 'interval_minutes', 'timeout_seconds', 'confirm_failures', 'active', 'status', 'uptime_percentage', 'avg_response_ms', 'last_checked_at', 'user_id', 'project_key'];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
