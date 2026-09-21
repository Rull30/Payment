<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the business and bank settings form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'settings' => [
                'business_name' => $user->business_name ?? '',
                'sender_name' => $user->sender_name ?? '',
                'bank_details' => $user->bank_details ?? [
                    'bank_name' => '',
                    'account_number' => '',
                    'account_holder' => '',
                ],
            ],
        ]);
    }

    /**
     * Update business and bank settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'sender_name' => ['required', 'string', 'max:255'],
            'bank_details' => ['required', 'array'],
            'bank_details.bank_name' => ['required', 'string', 'max:100'],
            'bank_details.account_number' => ['required', 'string', 'max:50'],
            'bank_details.account_holder' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $user->business_name = $validated['business_name'];
        $user->sender_name = $validated['sender_name'];
        $user->bank_details = $validated['bank_details'];
        $user->save();

        return back()->with('message', 'Business profile and bank details saved.');
    }
}
