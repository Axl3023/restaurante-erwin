import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { route } from 'ziggy-js';

type SupplyRow = {
    id: number;
    name: string;
    unit_measure: string;
    stock: number;
    minimum_stock: number;
    maximum_stock: number;
    is_alert: boolean;
};

interface AlertsProps {
    supplies: {
        data: SupplyRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Insumos', href: route('admin.supplies.stock.index') }];

export default function Alerts({ supplies }: AlertsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Insumos en reposición" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="inline-flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            <TriangleAlert className="h-5 w-5 text-amber-500" />
                            Insumos en reposición
                        </h1>
                        <a
                            href={route('admin.supplies.stock.index')}
                            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100"
                        >
                            Volver a configuración
                        </a>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {supplies.data.map((s) => (
                                        <tr key={s.id} className="bg-amber-50 dark:bg-amber-900/20">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {s.name} <span className="text-xs text-gray-500">({s.unit_measure})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.stock}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.minimum_stock}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{s.maximum_stock}</td>
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
