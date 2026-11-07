<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleWare
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        //$authUser = auth()->user(); // Get the authenticated user + Role name i.e = N + 1 (2 queries)

        $authUser = auth()->user()->load('role'); // Get the authenticated user + Role name in a single query

        if (!$authUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($authUser->role->name !== $role) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
