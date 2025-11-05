<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supply;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplyStockController extends Controller
{
    // Lista general para configurar mínimos/máximos
    public function index(Request $request)
    {
        $query = Supply::query()->orderBy('name');

        // opcional: filtro por texto
        if ($search = $request->string('q')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        $supplies = $query->paginate(15)->through(function ($s) {
            return [
                'id'             => $s->id,
                'name'           => $s->name,
                'unit_measure'   => $s->unit_measure,
                'stock'          => $s->stock,
                'unit_price'     => (float)$s->unit_price,
                'minimum_stock'  => $s->minimum_stock,
                'maximum_stock'  => $s->maximum_stock,
                'is_alert'       => $s->is_alert,
            ];
        });

        return Inertia::render('Admin/Supplies/Stock/Index', [
            'supplies' => $supplies,
            'filters'  => [
                'q' => $request->string('q')->toString(),
            ],
        ]);
    }

    // Solo insumos en alerta (reposiciones)
    public function alerts(Request $request)
    {
        $supplies = Supply::inAlert()
            ->orderBy('name')
            ->paginate(20)->through(function ($s) {
                return [
                    'id'            => $s->id,
                    'name'          => $s->name,
                    'unit_measure'  => $s->unit_measure,
                    'stock'         => $s->stock,
                    'minimum_stock' => $s->minimum_stock,
                    'maximum_stock' => $s->maximum_stock,
                    'is_alert'      => true,
                ];
            });

        return Inertia::render('Admin/Supplies/Stock/Alerts', [
            'supplies' => $supplies,
        ]);
    }

    // Actualiza un insumo (mínimo/máximo)
    public function update(Request $request, Supply $supply)
    {
        $data = $request->validate([
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'maximum_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        // Si máximo está definido, debe ser >= mínimo
        if (isset($data['maximum_stock']) && $data['maximum_stock'] !== null) {
            $request->validate([
                'maximum_stock' => ['gte:minimum_stock'],
            ]);
        }

        $supply->update([
            'minimum_stock' => $data['minimum_stock'],
            'maximum_stock' => $data['maximum_stock'] ?? 0,
        ]);

        return back()->with('success', 'Configuración de stock guardada.');
    }
}
