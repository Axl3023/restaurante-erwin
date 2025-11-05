import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Search, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

type SupplyRow = {
    id: number;
    name: string;
    unit_measure: string;
    stock: number;
    unit_price: number;
    minimum_stock: number;
    maximum_stock: number;
    is_alert: boolean;
};

interface IndexProps {
    supplies: {
        data: SupplyRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { q?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Insumos', href: route('admin.supplies.stock.index') }];

function RowForm({ s }: { s: SupplyRow }) {
    const { data, setData, patch, processing } = useForm({
        minimum_stock: s.minimum_stock ?? 0,
        maximum_stock: s.maximum_stock ?? 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.supplies.stock.update', s.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="flex items-center justify-end gap-2">
            <input
                type="number"
                min={0}
                value={data.minimum_stock}
                onChange={(e) => setData('minimum_stock', Number(e.target.value || 0))}
                className="w-24 rounded-md border-gray-300 text-right shadow-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <input
                type="number"
                min={0}
                value={data.maximum_stock}
                onChange={(e) => setData('maximum_stock', Number(e.target.value || 0))}
                className="w-24 rounded-md border-gray-300 text-right shadow-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                title="Guardar"
            >
                <Check className="h-4 w-4" />
                Guardar
            </button>
        </form>
    );
}

export default function Index({ supplies, filters }: IndexProps) {
    const [q, setQ] = useState(filters.q || '');

    const doSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.supplies.stock.index'), { q }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurar stock" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Configurar stock</h1>
                        <a
                            href={route('admin.supplies.stock.alerts')}
                            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
                        >
                            <TriangleAlert className="h-4 w-4" />
                            Insumos en reposición
                        </a>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
                        <form onSubmit={doSearch} className="mb-4 flex items-center gap-2">
                            <div className="relative w-full max-w-sm">
                                <input
                                    placeholder="Buscar insumo..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="w-full rounded-md border-gray-300 pl-9 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                />
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                            </div>
                            <button className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100">
                                Buscar
                            </button>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Insumo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                            Mínimo
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                            Máximo
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {supplies.data.map((s) => (
                                        <tr key={s.id} className={s.is_alert ? 'bg-amber-50 dark:bg-amber-900/20' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {s.name} <span className="text-xs text-gray-500">({s.unit_measure})</span>
                                                </div>
                                                {s.is_alert && (
                                                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-800/40 dark:text-amber-100">
                                                        <TriangleAlert className="h-3 w-3" /> En alerta
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.stock}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.minimum_stock}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.maximum_stock}</td>
                                            <td className="px-6 py-2">
                                                <RowForm s={s} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {supplies.links.map((lnk) => (
                                <a
                                    key={lnk.label + lnk.url}
                                    href={lnk.url ?? '#'}
                                    dangerouslySetInnerHTML={{ __html: lnk.label }}
                                    className={`rounded px-3 py-1 text-sm ${
                                        lnk.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
