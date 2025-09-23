<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function show(Sale $sale)
    {
        $sale->load(['order.products', 'customer', 'order.user', 'order.table']);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => [
                'id' => $sale->id,
                'series' => $sale->series,
                'number'   => str_pad((string) $sale->number, 8, '0', STR_PAD_LEFT), // <-- padding aquí
                'type'     => $sale->receipt_type,
                'status' => $sale->status,
                'issued_at' => $sale->issued_at,
                'subtotal' => $sale->subtotal,
                'tax' => $sale->tax,
                'total' => $sale->total,
                'customer' => $sale->customer,
                'order' => [
                    'id' => $sale->order->id,
                    'table' => $sale->order->table ? ['id' => $sale->order->table->id, 'name' => $sale->order->table->name] : null,
                    'user'  => $sale->order->user ? ['id' => $sale->order->user->id, 'name' => $sale->order->user->name] : null,
                    'items' => $sale->order->products->map(function ($p) {
                        return [
                            'id' => $p->id,
                            'name' => $p->name,
                            'price' => (float)$p->pivot->price,
                            'quantity' => (int)$p->pivot->quantity,
                            'total' => (float)$p->pivot->price * (int)$p->pivot->quantity,
                        ];
                    })->values(),
                ],
            ],
        ]);
    }

    public function pdf(Sale $sale)
    {
        $sale->load(['order.products', 'customer', 'order.user', 'order.table']);

        $pdf = Pdf::loadView('pdf.sale', compact('sale'))->setPaper('a4');
        $filename = "{$sale->series}-" . str_pad((string) $sale->number, 8, '0', STR_PAD_LEFT) . ".pdf";

        // Muestra el PDF en el navegador
        return $pdf->stream($filename);
    }
}
