import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Row = { key_id?: number | null; key_label: string; sales_count: number; subtotal: number; tax: number; total: number };
type Payment = { method: string; total: number };

interface Props {
    filters: { from: string; to: string; group: 'date' | 'table' | 'category' };
    rows: Row[];
    summary: { sales_count: number; subtotal: number; tax: number; total: number };
    payments: Payment[];
    tables: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: route('admin.reports.sales') },
    { title: 'Ventas', href: route('admin.reports.sales') },
];

export default function SalesReport({ filters, rows, summary, payments }: Props) {
    const fmt = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

    const onChange = (name: string, value: string) => {
        const q = new URLSearchParams({
            from: filters.from,
            to: filters.to,
            group: filters.group,
        });
        q.set(name, value);
        router.get(route('admin.reports.sales'), Object.fromEntries(q), { preserveState: true, replace: true });
    };

    const pdfUrl = route('admin.reports.sales.pdf', filters);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes de Ventas" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-200">Desde</label>
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(e) => onChange('from', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-200">Hasta</label>
                                <input
                                    type="date"
                                    value={filters.to}
                                    onChange={(e) => onChange('to', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-200">Agrupar por</label>
                                <select
                                    value={filters.group}
                                    onChange={(e) => onChange('group', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                >
                                    <option value="date">Fecha</option>
                                    <option value="table">Mesa</option>
                                    <option value="category">Categoría</option>
                                </select>
                            </div>

                            {/* Botón PDF */}
                            <div className="flex items-end justify-end">
                                <a
                                    href={pdfUrl}
                                    className="inline-flex rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                                >
                                    Emitir reporte (PDF)
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Resumen + Formas de pago */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Comprobantes</div>
                            <div className="mt-1 text-3xl font-semibold dark:text-gray-100">{summary.sales_count}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Subtotal</div>
                            <div className="mt-1 text-3xl font-semibold dark:text-gray-100">{fmt(summary.subtotal)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">IGV</div>
                            <div className="mt-1 text-3xl font-semibold dark:text-gray-100">{fmt(summary.tax)}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                            <div className="mt-1 text-3xl font-semibold dark:text-gray-100">{fmt(summary.total)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="overflow-hidden rounded-lg bg-white shadow md:col-span-2 dark:bg-gray-800">
                            <div className="border-b p-4 text-sm font-medium dark:border-gray-700 dark:text-gray-200">
                                {filters.group === 'date' && 'Ventas por fecha'}
                                {filters.group === 'table' && 'Ventas por mesa'}
                                {filters.group === 'category' && 'Ventas por categoría'}
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider uppercase dark:text-gray-200">
                                                {filters.group === 'date' ? 'Fecha' : filters.group === 'table' ? 'Mesa' : 'Categoría'}
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium tracking-wider uppercase dark:text-gray-200">
                                                Comp.
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium tracking-wider uppercase dark:text-gray-200">
                                                Subtotal
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium tracking-wider uppercase dark:text-gray-200">
                                                IGV
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium tracking-wider uppercase dark:text-gray-200">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rows.map((r, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 text-sm dark:text-gray-100">{r.key_label}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">{r.sales_count}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">{fmt(r.subtotal)}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">{fmt(r.tax)}</td>
                                                <td className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-100">{fmt(r.total)}</td>
                                            </tr>
                                        ))}
                                        {rows.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Sin resultados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="mb-2 text-sm font-medium dark:text-gray-200">Formas de pago</div>
                            <div className="space-y-2">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="capitalize dark:text-gray-100">{p.method}</div>
                                        <div className="font-semibold dark:text-gray-100">{fmt(p.total)}</div>
                                    </div>
                                ))}
                                {payments.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">—</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
