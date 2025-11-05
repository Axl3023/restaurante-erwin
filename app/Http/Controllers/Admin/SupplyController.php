<?php

namespace App\Http\Controllers\Admin;

use App\Models\Supply;
use App\Models\Supplier;
use App\Models\WarehouseEntry;
use App\Models\WarehouseEntryDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;


class SupplyController extends Controller
{
    /** LISTA (historial): fecha, proveedor, total */
    public function index(Request $request)
    {
        $entries = WarehouseEntry::query()
            ->with(['supplier:id,company_name', 'details:id,warehouse_entry_id,quantity,unit_price'])
            ->orderByDesc('entry_date')
            ->paginate(12)
            ->through(function ($e) {
                return [
                    'id'          => $e->id,
                    'entry_date'  => optional($e->entry_date)->format('Y-m-d'),
                    'supplier'    => $e->supplier?->company_name,
                    'total'       => $e->total,
                    'created_at'  => optional($e->created_at)->toDateTimeString(),
                ];
            });

        return Inertia::render('Admin/WarehouseEntries/Index', [
            'entries' => $entries,
        ]);
    }

    /** FORM NUEVA ENTRADA */
    public function create()
    {
        return Inertia::render('Admin/WarehouseEntries/Form', [
            'mode'      => 'create',
            'suppliers' => Supplier::orderBy('company_name')->get(['id', 'company_name']),
            'supplies'  => Supply::orderBy('name')->get(['id', 'name', 'unit_measure', 'stock', 'unit_price']),
            'entry'     => null,
        ]);
    }

    /** GUARDAR NUEVA ENTRADA */
    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id'      => ['required', 'exists:suppliers,id'],
            'entry_date'       => ['required', 'date'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.supply_id' => ['required', 'exists:supplies,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data) {
            $entry = WarehouseEntry::create([
                'supplier_id' => $data['supplier_id'],
                'entry_date'  => $data['entry_date'],
            ]);

            foreach ($data['items'] as $row) {
                WarehouseEntryDetail::create([
                    'warehouse_entry_id' => $entry->id,
                    'supply_id'          => $row['supply_id'],
                    'quantity'           => $row['quantity'],
                    'unit_price'         => $row['unit_price'],
                ]);

                // Aumentar stock
                $this->adjustStock($row['supply_id'], +$row['quantity']);
                // (opcional) actualizar precio de referencia
                Supply::where('id', $row['supply_id'])->update(['unit_price' => $row['unit_price']]);
            }
        });

        return back()->with('success', 'Entrada registrada y stock actualizado.');
    }

    /** FORM EDITAR */
    public function edit(WarehouseEntry $warehouseEntry)
    {
        $warehouseEntry->load([
            'supplier:id,company_name',
            'details.supply:id,name,unit_measure,stock,unit_price'
        ]);

        return Inertia::render('Admin/WarehouseEntries/Form', [
            'mode'      => 'edit',
            'suppliers' => Supplier::orderBy('company_name')->get(['id', 'company_name']),
            'supplies'  => Supply::orderBy('name')->get(['id', 'name', 'unit_measure', 'stock', 'unit_price']),
            'entry'     => [
                'id'         => $warehouseEntry->id,
                'supplier_id' => $warehouseEntry->supplier_id,
                'entry_date' => optional($warehouseEntry->entry_date)->format('Y-m-d'),
                'items'      => $warehouseEntry->details->map(function ($d) {
                    return [
                        'id'         => $d->id,
                        'supply_id'  => $d->supply_id,
                        'quantity'   => $d->quantity,
                        'unit_price' => (float)$d->unit_price,
                        'supply'     => [
                            'name'         => $d->supply->name,
                            'unit_measure' => $d->supply->unit_measure,
                        ]
                    ];
                }),
            ],
        ]);
    }

    /** ACTUALIZAR ENTRADA (reajusta stock) */
    public function update(Request $request, WarehouseEntry $warehouseEntry)
    {
        $data = $request->validate([
            'supplier_id'      => ['required', 'exists:suppliers,id'],
            'entry_date'       => ['required', 'date'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.supply_id' => ['required', 'exists:supplies,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data, $warehouseEntry) {
            // Revertir stock previo
            $warehouseEntry->load('details');
            foreach ($warehouseEntry->details as $old) {
                $this->adjustStock($old->supply_id, -$old->quantity); // restar ingreso anterior
            }
            // borrar detalles previos
            WarehouseEntryDetail::where('warehouse_entry_id', $warehouseEntry->id)->delete();

            // actualizar cabecera
            $warehouseEntry->update([
                'supplier_id' => $data['supplier_id'],
                'entry_date'  => $data['entry_date'],
            ]);

            // crear nuevos detalles y ajustar stock
            foreach ($data['items'] as $row) {
                WarehouseEntryDetail::create([
                    'warehouse_entry_id' => $warehouseEntry->id,
                    'supply_id'          => $row['supply_id'],
                    'quantity'           => $row['quantity'],
                    'unit_price'         => $row['unit_price'],
                ]);
                $this->adjustStock($row['supply_id'], +$row['quantity']);
                Supply::where('id', $row['supply_id'])->update(['unit_price' => $row['unit_price']]);
            }
        });

        return back()->with('success', 'Entrada actualizada y stock reajustado.');
    }

    /** ELIMINAR ENTRADA (revierte stock afectado) */
    public function destroy(WarehouseEntry $warehouseEntry)
    {
        DB::transaction(function () use ($warehouseEntry) {
            $warehouseEntry->load('details');
            foreach ($warehouseEntry->details as $d) {
                $this->adjustStock($d->supply_id, -$d->quantity);
            }
            WarehouseEntryDetail::where('warehouse_entry_id', $warehouseEntry->id)->delete();
            $warehouseEntry->delete();
        });

        return back()->with('success', 'Entrada eliminada y stock revertido.');
    }

    /** ---- Helpers ---- */

    /**
     * Ajusta el stock y evita negativos “accidentales”.
     * Lanza ValidationException si el ajuste dejaría stock < 0.
     */
    protected function adjustStock(int $supplyId, int $delta): void
    {
        $supply = Supply::lockForUpdate()->findOrFail($supplyId);
        $new = $supply->stock + $delta;

        if ($new < 0) {
            throw ValidationException::withMessages([
                'stock' => "El ajuste de stock para {$supply->name} dejaría el stock negativo.",
            ]);
        }

        $supply->update(['stock' => $new]);
    }
}
