import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión de Pedidos',
        href: route('admin.orders.index'),
    },
];

// --- Tipos de Datos ---
interface User {
    id: number;
    name: string;
}

interface Table {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    pivot: {
        quantity: number;
        price: number;
    };
}

interface Order {
    id: number;
    total: number;
    status: 'pendiente' | 'en_proceso' | 'servido' | 'pagado' | 'cancelado';
    created_at: string;
    user: User;
    table: Table;
    products: Product[];
}

interface OrdersProps {
    orders: {
        data: Order[];
    };
    tables: Table[];
    users: User[];
}

// --- Componente para el Modal de Detalles ---
function OrderDetailsModal({ order, closeModal }: { order: Order; closeModal: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalles del Pedido #{order.id}</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Mesa</h3>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{order.table.name}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Total</h3>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">S/. {order.total.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Mesero</h3>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{order.user.name}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Estado</h3>
                        <p className={`text-lg font-bold ${
                            order.status === 'pendiente' ? 'text-yellow-900 dark:text-yellow-100' :
                            order.status === 'en_proceso' ? 'text-blue-900 dark:text-blue-100' :
                            order.status === 'servido' ? 'text-green-900 dark:text-green-100' :
                            order.status === 'pagado' ? 'text-green-900 dark:text-green-100' :
                            'text-red-900 dark:text-red-100'
                        }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Productos</h3>
                    <div className="space-y-2">
                        {order.products.map((product) => (
                            <div key={product.id} className="flex justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">x{product.pivot.quantity}</span>
                                </div>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    S/. {(product.pivot.price * product.pivot.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={closeModal}
                        className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Función para obtener el color del estado ---
function getStatusColor(status: string) {
    switch (status) {
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'en_proceso':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
        case 'servido':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        case 'pagado':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        case 'cancelado':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
}

export default function Index({ orders }: OrdersProps) {
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const resolveOrder = (order: Order) => {
        if (order.status === 'cancelado') {
            alert('No se puede resolver un pedido cancelado.');
            return;
        }

        router.patch(route('admin.orders.resolve', order.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const cancelOrder = (order: Order) => {
        if (order.status === 'pagado') {
            alert('No se puede cancelar un pedido ya pagado.');
            return;
        }

        if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
            router.patch(route('admin.orders.cancel', order.id), {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Tabla de pedidos */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Gestión de Pedidos</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Mesa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Mesero
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Fecha
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {orders.data.map((order) => (
                                        <tr key={order.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                #{order.id}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                {order.table.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                {order.user.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                S/. {order.total}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(order.created_at).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {order.status !== 'pagado' && order.status !== 'cancelado' && (
                                                        <button
                                                            onClick={() => resolveOrder(order)}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Resolver pedido"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {order.status !== 'pagado' && order.status !== 'cancelado' && (
                                                        <button
                                                            onClick={() => cancelOrder(order)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Cancelar pedido"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {orders.data.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No hay pedidos registrados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {viewingOrder && <OrderDetailsModal order={viewingOrder} closeModal={() => setViewingOrder(null)} />}
        </AppLayout>
    );
}
