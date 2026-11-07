<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Get(
        path: '/api/users',
        summary: 'List users',
        tags: ['Users'],
        parameters: [
            new OA\Parameter(
                name: 'search',
                description: 'Filter users by name or email',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string'),
            ),
            new OA\Parameter(
                name: 'page',
                description: 'Page number',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', minimum: 1, default: 1),
            ),
            new OA\Parameter(
                name: 'per_page',
                description: 'Users per page (1-100)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 10),
            ),
        ],
        responses: [new OA\Response(response: 200, description: 'Paginated user list')],
    )]
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $search = trim($validated['search'] ?? '');
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) ($validated['per_page'] ?? 10);
        $cacheKey = 'users:list:'.hash('sha256', json_encode([$search, $page, $perPage], JSON_THROW_ON_ERROR));

        $users = Cache::store('redis')->tags(['users'])->remember(
            $cacheKey,
            now()->addMinutes(10),
            static function () use ($search, $page, $perPage): array {
                $query = User::query();

                if ($search !== '') {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }

                return $query->latest()
                    ->orderByDesc('id')
                    ->paginate($perPage, ['*'], 'page', $page)
                    ->appends(['search' => $search, 'per_page' => $perPage])
                    ->toArray();
            },
        );

        return response()->json([
            'status' => true,
            'message' => 'User data fetched successfully!',
            'data' => $users,
        ]);
    }

    #[OA\Post(
        path: '/api/auth/create',
        summary: 'Create a new user',
        tags: ['Users'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255),
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                    new OA\Property(property: 'password', type: 'string', minLength: 8),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'User created successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ],
    )]
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'name.required' => 'Please provide a name.',
            'name.string' => 'Name must be text.',
            'name.max' => 'Name may not be longer than 255 characters.',
            'email.required' => 'Please provide an email address.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email may not be longer than 255 characters.',
            'email.unique' => 'An account with this email already exists.',
            'password.required' => 'Please provide a password.',
            'password.string' => 'Password must be text.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed. Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Cache::store('redis')->tags(['users'])->flush();

        return response()->json([
            'status' => true,
            'message' => 'User created successfully!',
            'data' => $user,
        ], 201);
    }

    #[OA\Post(
        path: '/api/auth/login',
        summary: 'Authenticate user and return API token',
        tags: ['Users'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                    new OA\Property(property: 'password', type: 'string', minLength: 8),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login successful'),
            new OA\Response(response: 401, description: 'Invalid credentials'),
        ],
    )]
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ]);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        summary: 'Logout user and revoke API token',
        tags: ['Users'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Logout successful'),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ],
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    #[OA\Delete(
        path: '/api/users/{user}',
        summary: 'Delete a user',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'user',
                description: 'ID of the user to delete',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Not authorized to delete this user'),
            new OA\Response(response: 404, description: 'User not found'),
        ],
    )]

    #[OA\Delete(
        path: '/api/users/{user}',
        summary: 'Delete a user',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'user',
                description: 'ID of the user to delete',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Not authorized to delete this user'),
            new OA\Response(response: 404, description: 'User not found'),
        ],
    )]
    public function deleteUser(Request $request, User $user)
    {
        $actor = $request->user();

        if ($actor->role?->name !== 'admin' && $actor->isNot($user)) {
            return response()->json([
                'status' => false,
                'message' => 'You are not authorized to delete this user.',
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();
        Cache::store('redis')->tags(['users'])->flush();

        return response()->json([
            'status' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
