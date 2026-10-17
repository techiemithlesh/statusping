<x-mail::message>
# 🔴 Monitor Down: {{ $monitor->name }}

**URL:** {{ $monitor->url }}
**Down Since:** {{ $incident->started_at->diffForHumans() ?? now()->diffForHumans() }}
**Status Code:** {{ $ping->status_code ?? 'No response' }}
**Error:** {{ $ping->error_message ?? 'Timeout' }}

<x-mail::button :url="$monitor->url" color="error">
Check URL
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>