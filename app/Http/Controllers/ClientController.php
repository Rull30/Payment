<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search');

        $query = $user->clients()
            ->withCount('invoices')
            ->withSum('invoices as total_billed', 'total_amount')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(10)->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user->clients()->create($validated);

        return back()->with('message', 'Client added successfully.');
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, Client $client): RedirectResponse
    {
        $user = $request->user();

        if ($client->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $client->update($validated);

        return back()->with('message', 'Client updated successfully.');
    }

    /**
     * Remove the specified client.
     */
    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $user = $request->user();

        if ($client->user_id !== $user->id) {
            abort(403);
        }

        $client->delete();

        return back()->with('message', 'Client deleted successfully.');
    }
}
