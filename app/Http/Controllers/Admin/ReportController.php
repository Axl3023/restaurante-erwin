<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Table;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{

    public function sales(Request $request)
    {
        $group = in_array($request->get('group'), ['date', 'table', 'category']) ? $request->get('group') : 'date';

        $from = $request->get('from', now()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $start = Carbon::parse($from)->startOfDay();
        $end   = Carbon::parse($to)->endOfDay();

        // ====== agrupaciones ======
        if ($group === 'table') {
            // Totales por mesa
            $rows = Sale::query()
                ->join('orders', 'orders.id', '=', 'sales.order_id')
                ->join('tables', 'tables.id', '=', 'orders.table_id')
                ->whereBetween('sales.issued_at', [$start, $end])
                ->selectRaw('tables.id as key_id, tables.name as key_label, COUNT(sales.id) as sales_count, SUM(sales.subtotal) as subtotal, SUM(sales.tax) as tax, SUM(sales.total) as total')
                ->groupBy('tables.id', 'tables.name')
                ->orderBy('tables.name')
                ->get();
        } elseif ($group === 'category') {
            // Totales construidos desde líneas (order_product) por categoría
            $rows = DB::table('order_product as op')
                ->join('orders as o', 'o.id', '=', 'op.order_id')
                ->join('sales as s', 's.order_id', '=', 'o.id')
                ->join('products as p', 'p.id', '=', 'op.product_id')
                ->join('categories as c', 'c.id', '=', 'p.category_id')
                ->whereBetween('s.issued_at', [$start, $end])
                ->selectRaw('c.id as key_id, c.name as key_label, COUNT(DISTINCT s.id) as sales_count,
                             SUM(op.quantity * op.price) as total')
                ->groupBy('c.id', 'c.name')
                ->orderBy('c.name')
                ->get()
                ->map(function ($r) {
                    $subtotal = round($r->total / 1.18, 2);
                    $tax      = round($r->total - $subtotal, 2);
                    $r->subtotal = $subtotal;
                    $r->tax = $tax;
                    return $r;
                });
        } else {
            // Por fecha (default)
            $rows = Sale::query()
                ->whereBetween('issued_at', [$start, $end])
                ->selectRaw('DATE(issued_at) as key_label, COUNT(id) as sales_count, SUM(subtotal) as subtotal, SUM(tax) as tax, SUM(total) as total')
                ->groupBy(DB::raw('DATE(issued_at)'))
                ->orderBy('key_label')
                ->get()
                ->map(function ($r) {
                    $r->key_id = null;
                    return $r;
                });
        }

        // ====== Resumen general ======
        $summary = [
            'sales_count' => (int) $rows->sum('sales_count'),
            'subtotal'    => round((float) $rows->sum('subtotal'), 2),
            'tax'         => round((float) $rows->sum('tax'), 2),
            'total'       => round((float) $rows->sum('total'), 2),
        ];

        // ====== Formas de pago (global del período) ======
        $payments = Payment::query()
            ->join('orders', 'orders.id', '=', 'payments.order_id')
            ->join('sales', 'sales.order_id', '=', 'orders.id')
            ->whereBetween('sales.issued_at', [$start, $end])
            ->selectRaw('payments.method, SUM(payments.amount) as total')
            ->groupBy('payments.method')
            ->orderBy('payments.method')
            ->get();

        return Inertia::render('Admin/Reports/Sales', [
            'filters' => [
                'from'  => $start->toDateString(),
                'to'    => $end->toDateString(),
                'group' => $group,
            ],
            'rows' => $rows,
            'summary' => $summary,
            'payments' => $payments,
            // para selects si luego quieres filtrar adicionalmente
            'tables' => Table::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function salesPdf(Request $request)
    {
        // Reutilizamos la misma lógica que sales(), pero sin Inertia
        $request->merge([
            'group' => $request->get('group', 'date'),
            'from'  => $request->get('from', now()->toDateString()),
            'to'    => $request->get('to', now()->toDateString()),
        ]);

        // Llama internamente a sales() para no duplicar demasiado código:
        // (o copia/pega la lógica de arriba si prefieres)
        $group = $request->get('group');
        $from  = $request->get('from');
        $to    = $request->get('to');

        // === Build same data ===
        $start = Carbon::parse($from)->startOfDay();
        $end   = Carbon::parse($to)->endOfDay();

        if ($group === 'table') {
            $rows = Sale::query()
                ->join('orders', 'orders.id', '=', 'sales.order_id')
                ->join('tables', 'tables.id', '=', 'orders.table_id')
                ->whereBetween('sales.issued_at', [$start, $end])
                ->selectRaw('tables.name as key_label, COUNT(sales.id) as sales_count, SUM(sales.subtotal) as subtotal, SUM(sales.tax) as tax, SUM(sales.total) as total')
                ->groupBy('tables.name')
                ->orderBy('tables.name')
                ->get();
        } elseif ($group === 'category') {
            $rows = DB::table('order_product as op')
                ->join('orders as o', 'o.id', '=', 'op.order_id')
                ->join('sales as s', 's.order_id', '=', 'o.id')
                ->join('products as p', 'p.id', '=', 'op.product_id')
                ->join('categories as c', 'c.id', '=', 'p.category_id')
                ->whereBetween('s.issued_at', [$start, $end])
                ->selectRaw('c.name as key_label, COUNT(DISTINCT s.id) as sales_count, SUM(op.quantity * op.price) as total')
                ->groupBy('c.name')
                ->orderBy('c.name')
                ->get()
                ->map(function ($r) {
                    $subtotal = round($r->total / 1.18, 2);
                    $tax      = round($r->total - $subtotal, 2);
                    $r->subtotal = $subtotal;
                    $r->tax = $tax;
                    return $r;
                });
        } else {
            $rows = Sale::query()
                ->whereBetween('issued_at', [$start, $end])
                ->selectRaw('DATE(issued_at) as key_label, COUNT(id) as sales_count, SUM(subtotal) as subtotal, SUM(tax) as tax, SUM(total) as total')
                ->groupBy(DB::raw('DATE(issued_at)'))
                ->orderBy('key_label')
                ->get();
        }

        $summary = [
            'sales_count' => (int) $rows->sum('sales_count'),
            'subtotal'    => round((float) $rows->sum('subtotal'), 2),
            'tax'         => round((float) $rows->sum('tax'), 2),
            'total'       => round((float) $rows->sum('total'), 2),
        ];

        $payments = Payment::query()
            ->join('orders', 'orders.id', '=', 'payments.order_id')
            ->join('sales', 'sales.order_id', '=', 'orders.id')
            ->whereBetween('sales.issued_at', [$start, $end])
            ->selectRaw('payments.method, SUM(payments.amount) as total')
            ->groupBy('payments.method')
            ->orderBy('payments.method')
            ->get();

        $pdf = Pdf::loadView('pdf.report_sales', [
            'filters'  => ['from' => $from, 'to' => $to, 'group' => $group],
            'rows'     => $rows,
            'summary'  => $summary,
            'payments' => $payments,
        ])->setPaper('a4', 'portrait');

        $fname = "reporte_ventas_{$group}_{$from}_{$to}.pdf";
        return $pdf->download($fname);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
