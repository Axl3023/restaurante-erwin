<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // GET /admin/customers/search?doc_number=12345678
    public function search(Request $request)
    {
        $request->validate([
            'doc_number' => 'required|string|max:20'
        ]);

        $customer = Customer::where('doc_number', $request->doc_number)->first();

        return response()->json([
            'found' => (bool) $customer,
            'customer' => $customer,
        ]);
    }

    // POST /admin/customers (alta inline desde el modal)
    public function store(Request $request)
    {
        $request->validate([
            'doc_type'   => 'required|in:DNI,RUC',
            'doc_number' => 'required|string|max:20|unique:customers,doc_number',
            'name'       => 'required|string|max:255',
            'email'      => 'nullable|email|max:255',
            'phone'      => 'nullable|string|max:50',
            'address'    => 'nullable|string|max:255',
        ]);

        $customer = Customer::create($request->only([
            'doc_type',
            'doc_number',
            'name',
            'email',
            'phone',
            'address'
        ]));

        return response()->json([
            'ok' => true,
            'customer' => $customer,
        ], 201);
    }
}
