<x-mail::message>
# Welcome to StatusPing

Hi {{ $user->name }},

Thanks for creating an account with **StatusPing**. Your account is ready, and you can now start monitoring the services that matter to you.

With StatusPing, you can:

- Keep an eye on the availability of your services.
- Spot incidents and review uptime history.
- Receive alerts when a monitored service needs attention.

<x-mail::button :url="config('app.url')">
Open your dashboard
</x-mail::button>

If you have any questions, just reply to this email and our team will be happy to help.

Thanks,<br>
The StatusPing Team
</x-mail::message>
