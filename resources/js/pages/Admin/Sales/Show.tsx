import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Item {
    id: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
}
interface SaleProps {
    sale: {
        id: number;
        series: string;
        number: string;
        type: 'boleta' | 'factura';
        status: 'emitido' | 'anulado';
        issued_at: string;
        subtotal: number;
        tax: number;
        total: number;
        customer?: { id: number; name: string; doc_type: 'DNI' | 'RUC'; doc_number: string; email?: string; address?: string } | null;
        order: {
            id: number;
            table?: { id: number; name: string } | null;
            user?: { id: number; name: string } | null;
            items: Item[];
        };
    };
}

export default function Show({ sale }: SaleProps) {
    const title = `${sale.type.toUpperCase()} ${sale.series}-${sale.number}`;

    return (
        <AppLayout breadcrumbs={[{ title: 'Resumen de Venta', href: route('admin.sales.show', sale.id) }]}>
            <Head title={title} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Emitido: {new Date(sale.issued_at).toLocaleString('es-PE')}
                            {sale.order.table ? ` · Mesa: ${sale.order.table.name}` : ''}
                            {sale.order.user ? ` · Mesero: ${sale.order.user.name}` : ''}
                        </div>

                        <div className="mt-4 rounded-md border p-4 dark:border-gray-700">
                            <div className="mb-2 text-sm font-semibold dark:text-gray-200">Cliente</div>
                            {sale.customer ? (
                                <div className="text-sm dark:text-gray-200">
                                    <div>{sale.customer.name}</div>
                                    <div>
                                        {sale.customer.doc_type} {sale.customer.doc_number}
                                    </div>
                                    {sale.customer.address && <div>{sale.customer.address}</div>}
                                    {sale.customer.email && <div>{sale.customer.email}</div>}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">Sin datos de cliente</div>
                            )}
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 text-sm font-semibold dark:text-gray-200">Detalle</div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Producto
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Cant
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Precio
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {sale.order.items.map((it) => (
                                            <tr key={it.id}>
                                                <td className="px-4 py-2 text-sm dark:text-gray-100">{it.name}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">{it.quantity}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">S/ {it.price.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right text-sm dark:text-gray-100">S/ {it.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-100">
                                                Subtotal
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-100">
                                                S/ {sale.subtotal.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-100">
                                                IGV (18%)
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-100">
                                                S/ {sale.tax.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-lg font-bold dark:text-gray-100">
                                                Total
                                            </td>
                                            <td className="px-4 py-2 text-right text-lg font-bold dark:text-gray-100">S/ {sale.total.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <button
                        onClick={() => window.open(route('admin.sales.pdf', sale.id), '_blank', 'noopener')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                        Ver/Descargar PDF
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
