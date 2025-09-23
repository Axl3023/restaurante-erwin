<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Table;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Orders/Index', [
            'orders' => Order::with(['user', 'table', 'products'])
                // ->latest()
                ->paginate(10),
            'tables' => Table::orderBy('name')->get(),
            'users' => User::orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Los pedidos se crean desde el POS, no desde admin
        return redirect()->route('admin.orders.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order->load(['user', 'table', 'products']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pendiente,en_proceso,servido,pagado,cancelado',
        ]);

        $order->update([
            'status' => $request->status,
        ]);

        return redirect()->route('admin.orders.index')
            ->with('success', 'Estado del pedido actualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete(); // Soft delete

        return redirect()->route('admin.orders.index')
            ->with('success', 'Pedido eliminado.');
    }

    /**
     * Resolver pedido (marcar como pagado)
     */
    public function resolve(Order $order)
    {
        if ($order->status === 'cancelado') {
            return redirect()->route('admin.orders.index')
                ->with('error', 'No se puede resolver un pedido cancelado.');
        }

        $order->update(['status' => 'pagado']);
        $order->table()->update(['status' => 'libre']);  // también válido para BelongsTo

        return redirect()->route('admin.orders.index')
            ->with('success', 'Pedido resuelto y marcado como pagado.');
    }

    /**
     * Cancelar pedido
     */
    public function cancel(Order $order)
    {
        if ($order->status === 'pagado') {
            return redirect()->route('admin.orders.index')
                ->with('error', 'No se puede cancelar un pedido ya pagado.');
        }

        $order->update(['status' => 'cancelado']);
        if ($order->table_id) {
        $order->table()->update(['status' => 'libre']);  // también válido para BelongsTo
    }

        return redirect()->route('admin.orders.index')
            ->with('success', 'Pedido cancelado.');
    }

    public function checkout(Request $request, Order $order)
    {
        $order->load('products', 'table');

        if ($order->status === 'pagado') {
            return back()->with('error', 'El pedido ya fue pagado.');
        }
        if ($order->status === 'cancelado') {
            return back()->with('error', 'No se puede cobrar un pedido cancelado.');
        }

        $validated = $request->validate([
            'type' => 'required|in:boleta,factura',
            'customer' => 'nullable|array',
            'customer.doc_type' => 'nullable|in:DNI,RUC',
            'customer.doc_number' => 'nullable|string|max:20',
            'customer.name' => 'nullable|string|max:255',
            'customer.email' => 'nullable|email|max:255',
            'customer.phone' => 'nullable|string|max:50',
            'customer.address' => 'nullable|string|max:255',

            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|in:efectivo,tarjeta,yape,plin,transferencia,otro',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.reference' => 'nullable|string|max:100',
        ]);

        // Total recomputado desde el pivot (confiable)
        $orderTotal = round($order->products->sum(
            fn($p) => (float) $p->pivot->price * (int) $p->pivot->quantity
        ), 2);

        // Suma de pagos
        $sumPayments = round(collect($validated['payments'])->sum('amount'), 2);
        if (abs($sumPayments - $orderTotal) > 0.01) {
            return back()->with('error', 'La suma de los pagos no coincide con el total del pedido.');
        }

        $saleId = null;

        try {
            DB::transaction(function () use ($validated, $order, $orderTotal, &$saleId) {
                // 1) Cliente
                $customerId = null;
                if (!empty($validated['customer']['doc_number'])) {
                    $docNumber = $validated['customer']['doc_number'];
                    $customer  = Customer::where('doc_number', $docNumber)->first();

                    if (!$customer) {
                        $docType = $validated['customer']['doc_type'] ?? (strlen($docNumber) === 11 ? 'RUC' : 'DNI');
                        $name    = $validated['customer']['name'] ?? 'Cliente';
                        $customer = Customer::create([
                            'doc_type'   => $docType,
                            'doc_number' => $docNumber,
                            'name'       => $name,
                            'email'      => $validated['customer']['email'] ?? null,
                            'phone'      => $validated['customer']['phone'] ?? null,
                            'address'    => $validated['customer']['address'] ?? null,
                        ]);
                    }
                    $customerId = $customer->id;
                }

                // 2) Pagos
                foreach ($validated['payments'] as $pay) {
                    Payment::create([
                        'order_id'  => $order->id,
                        'user_id'   => Auth::id(),   // asegúrate de estar logueado
                        'method'    => $pay['method'],
                        'amount'    => round((float) $pay['amount'], 2),
                        'reference' => $pay['reference'] ?? null,
                        'paid_at'   => now(),
                    ]);
                }

                // 3) Venta
                $subtotal = round($orderTotal / 1.18, 2);
                $tax      = round($orderTotal - $subtotal, 2);
                $series   = $validated['type'] === 'factura' ? 'F001' : 'B001';

                // Como 'number' es INT en la BD:
                $lastNumber = (int) Sale::where('series', $series)->max('number');
                $number     = $lastNumber + 1;

                $sale = Sale::create([
                    'order_id'     => $order->id,
                    'customer_id'  => $customerId,
                    'receipt_type' => $validated['type'], // <-- clave correcta según tu migración
                    'series'       => $series,
                    'number'       => $number,            // <-- entero
                    'subtotal'     => $subtotal,
                    'tax'          => $tax,
                    'total'        => $orderTotal,
                    'status'       => 'paid',             // o el que uses
                    'issued_at'    => now(),
                ]);
                $saleId = $sale->id;

                // 4) Pedido pagado + mesa libre
                $order->update(['status' => 'pagado', 'total' => $orderTotal]);
                optional($order->table)->update(['status' => 'libre']);
            });
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Ocurrió un error al cobrar el pedido.');
        }

        // 🔁 Fuerza navegación en Inertia
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('admin.sales.show', $saleId));
        }

        return redirect()->route('admin.sales.show', $saleId);
    }
}
