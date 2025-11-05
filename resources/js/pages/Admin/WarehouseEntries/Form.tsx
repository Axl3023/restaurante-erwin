import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

/* -------------------- Tipos -------------------- */
// Datos que llegan del backend (para selects y precarga)
interface Supplier {
    id: number;
    company_name: string;
}
interface SupplyRef {
    id: number;
    name: string;
    unit_measure: string;
    stock: number;
    unit_price: number;
}

// Detalle con “adorno” para leer (no se envía al backend)
interface DetailItem {
    id?: number;
    supply_id: number | string;
    quantity: number;
    unit_price: number;
    supply?: { name: string; unit_measure: string };
}

interface EntryPayload {
    id?: number;
    supplier_id: number | string;
    entry_date: string;
    items: DetailItem[];
}

// Tipo SOLO para el formulario (sin `supply`)
type DetailFormItem = {
    supply_id: number | string | '';
    quantity: number;
    unit_price: number; // <- ahora será el importe calculado = precioBase * cantidad
};

type EntryFormData = {
    supplier_id: number | string | '';
    entry_date: string;
    items: DetailFormItem[];
};

// Props de página tipadas para usePage (con index signature requerido por Inertia)
interface PageProps extends Record<string, any> {
    mode: 'create' | 'edit';
    suppliers: Supplier[];
    supplies: SupplyRef[];
    entry: EntryPayload | null;
}

/* -------------------- Migas -------------------- */

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Entradas', href: route('admin.entries.index') }];

/* -------------------- Componente -------------------- */

export default function Form() {
    const { mode, suppliers, supplies, entry } = usePage<PageProps>().props;

    // helper para precio base del insumo
    const basePriceOf = (supplyId: string | number | ''): number => {
        if (supplyId === '' || supplyId === null || supplyId === undefined) return 0;
        const s = supplies.find((ss) => String(ss.id) === String(supplyId));
        return s ? Number(s.unit_price || 0) : 0;
    };

    // Estado del formulario SIN la propiedad `supply` en cada item
    const { data, setData, post, put, processing, errors } = useForm<EntryFormData>({
        supplier_id: entry?.supplier_id ?? '',
        entry_date: entry?.entry_date ?? new Date().toISOString().slice(0, 10),
        items: entry?.items?.map<DetailFormItem>((it) => {
            // si viene con supply, calculamos unit_price como importe = base * cantidad
            const qty = typeof it.quantity === 'number' ? it.quantity : 0;
            const base = basePriceOf(it.supply_id ?? '');
            return {
                supply_id: it.supply_id ?? '',
                quantity: qty,
                unit_price: base * qty,
            };
        }) ?? [{ supply_id: '', quantity: 0, unit_price: 0 }],
    });

    const addRow = () => setData('items', [...data.items, { supply_id: '', quantity: 0, unit_price: 0 }]);

    const removeRow = (i: number) =>
        setData(
            'items',
            data.items.filter((_, idx) => idx !== i),
        );

    const updateRow = (i: number, patch: Partial<DetailFormItem>) => {
        const next = [...data.items];
        next[i] = { ...next[i], ...patch };
        setData('items', next);
    };

    // cuando se selecciona un insumo: qty = 1, unit_price = base * 1
    const onSupplyChange = (i: number, supplyId: string) => {
        const base = basePriceOf(supplyId);
        updateRow(i, {
            supply_id: supplyId,
            quantity: supplyId ? 1 : 0,
            unit_price: supplyId ? base * 1 : 0,
        });
    };

    // cuando cambia la cantidad: unit_price = base * cantidad
    const onQuantityChange = (i: number, qtyStr: string) => {
        const qty = Math.max(1, Number(qtyStr) || 0);
        const current = data.items[i];
        const base = basePriceOf(current.supply_id);
        updateRow(i, {
            quantity: qty,
            unit_price: base * qty,
        });
    };

    const total = data.items.reduce(
        (acc, it) => acc + Number(it.unit_price || 0), // unit_price ya es importe calculado
        0,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.entries.store'));
        } else {
            // entry existe en modo edit
            put(route('admin.entries.update', entry!.id as number));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Nueva entrada' : 'Editar entrada'} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Cabecera */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
                                    <select
                                        value={String(data.supplier_id)}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <option value="">Seleccione…</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.company_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <p className="mt-2 text-sm text-red-600">{errors.supplier_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                                    <input
                                        type="date"
                                        value={data.entry_date}
                                        onChange={(e) => setData('entry_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                    />
                                    {errors.entry_date && <p className="mt-2 text-sm text-red-600">{errors.entry_date}</p>}
                                </div>
                            </div>

                            {/* Detalle */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Insumo
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Cantidad
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Costo unit.
                                            </th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {data.items.map((it, i) => {
                                            const hasSupply = String(it.supply_id) !== '';
                                            return (
                                                <tr key={i}>
                                                    {/* Select insumo */}
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={String(it.supply_id)}
                                                            onChange={(e) => onSupplyChange(i, e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                                        >
                                                            <option value="">Seleccione…</option>
                                                            {supplies.map((s) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.name} ({s.unit_measure})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors[`items.${i}.supply_id` as keyof typeof errors] && (
                                                            <p className="mt-1 text-sm text-red-600">{(errors as any)[`items.${i}.supply_id`]}</p>
                                                        )}
                                                    </td>

                                                    {/* Cantidad (habilitada solo si hay insumo) */}
                                                    <td className="px-4 py-2 text-right">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={it.quantity}
                                                            onChange={(e) => onQuantityChange(i, e.target.value)}
                                                            disabled={!hasSupply}
                                                            className={`w-28 rounded-md border-gray-300 text-right shadow-sm dark:border-gray-700 dark:bg-gray-900 ${!hasSupply ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        />
                                                        {errors[`items.${i}.quantity` as keyof typeof errors] && (
                                                            <p className="mt-1 text-sm text-red-600">{(errors as any)[`items.${i}.quantity`]}</p>
                                                        )}
                                                    </td>

                                                    {/* Costo unitario (importe calculado) — SIEMPRE deshabilitado */}
                                                    <td className="px-4 py-2 text-right">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={Number(it.unit_price || 0).toFixed(2)}
                                                            disabled
                                                            className="w-32 cursor-not-allowed rounded-md border-gray-300 text-right opacity-80 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                                        />
                                                        {errors[`items.${i}.unit_price` as keyof typeof errors] && (
                                                            <p className="mt-1 text-sm text-red-600">{(errors as any)[`items.${i}.unit_price`]}</p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(i)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
                                                            title="Quitar"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Quitar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    Agregar insumo
                                </button>
                            </div>

                            {/* Totales + acciones */}
                            <div className="flex items-center justify-between">
                                <a
                                    href={route('admin.entries.index')}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Volver
                                </a>

                                <div className="flex items-center gap-6">
                                    <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                                        <div>Total</div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">S/ {total.toFixed(2)}</div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Guardando...' : mode === 'create' ? 'Guardar Entrada' : 'Actualizar Entrada'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
