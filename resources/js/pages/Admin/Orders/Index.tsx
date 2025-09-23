import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

const toNum = (v: unknown) => Number(v ?? 0);
const toInt = (v: unknown) => parseInt(String(v ?? 0), 10);

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
        quantity: number | string;
        price: number | string;
    };
}

interface Order {
    id: number;
    total: number | string;
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalles del Pedido #{order.id}</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">S/. {Number(order.total).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Mesero</h3>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{order.user.name}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Estado</h3>
                        <p
                            className={`text-lg font-bold ${
                                order.status === 'pendiente'
                                    ? 'text-yellow-900 dark:text-yellow-100'
                                    : order.status === 'en_proceso'
                                      ? 'text-blue-900 dark:text-blue-100'
                                      : order.status === 'servido'
                                        ? 'text-green-900 dark:text-green-100'
                                        : order.status === 'pagado'
                                          ? 'text-green-900 dark:text-green-100'
                                          : 'text-red-900 dark:text-red-100'
                            }`}
                        >
                            {order.status.replace('_', ' ').toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Productos</h3>
                    <div className="space-y-2">
                        {order.products.map((product) => {
                            const price = toNum(product.pivot?.price);
                            const qty = toInt(product.pivot?.quantity);
                            return (
                                <div key={product.id} className="flex justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">x{qty}</span>
                                    </div>
                                    <span className="font-bold text-green-600 dark:text-green-400">S/. {(price * qty).toFixed(2)}</span>
                                </div>
                            );
                        })}
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

function CheckoutModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const [step, setStep] = useState<'detail' | 'payment' | 'confirm'>('detail');

    // Customer
    const [docType, setDocType] = useState<'DNI' | 'RUC'>('DNI');
    const [docNumber, setDocNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerFound, setCustomerFound] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const expectedLen = docType === 'DNI' ? 8 : 11;
    const handleDocChange = (v: string) => {
        const onlyDigits = v.replace(/\D/g, '').slice(0, expectedLen);
        setDocNumber(onlyDigits);
        setCustomerFound(false);
        setHasSearched(false); // si cambias el nro, aún no “buscaste”
    };

    // Receipt
    const [receiptType, setReceiptType] = useState<'boleta' | 'factura'>('boleta');

    // Payments
    type PayRow = { method: 'efectivo' | 'tarjeta' | 'yape' | 'plin' | 'transferencia' | 'otro'; amount: number; reference?: string };
    const [payments, setPayments] = useState<PayRow[]>([{ method: 'efectivo', amount: Number(order.total), reference: '' }]);

    const total = Number(order.total);
    const sumPayments = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const remaining = Number((total - sumPayments).toFixed(2));

    const addPaymentRow = () => setPayments((prev) => [...prev, { method: 'efectivo', amount: Math.max(remaining, 0), reference: '' }]);
    const removePaymentRow = (idx: number) => setPayments((prev) => prev.filter((_, i) => i !== idx));
    const updatePaymentRow = (idx: number, patch: Partial<PayRow>) => {
        setPayments((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
    };

    // Buscar cliente por doc_number
    const searchCustomer = async () => {
        if (!docNumber) return;
        setHasSearched(true);

        try {
            const url = route('admin.customers.search') + `?doc_number=${encodeURIComponent(docNumber)}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!res.ok) {
                console.error('GET /customers/search failed', res.status, await res.text());
                setCustomerFound(false);
                return;
            }

            const data = await res.json();
            if (data?.found) {
                setCustomerFound(true);
                setDocType(data.customer.doc_type);
                setCustomerName(data.customer.name ?? '');
                setCustomerEmail(data.customer.email ?? '');
                setCustomerPhone(data.customer.phone ?? '');
                setCustomerAddress(data.customer.address ?? '');
            } else {
                setCustomerFound(false);
                setCustomerName('');
                setCustomerEmail('');
                setCustomerPhone('');
                setCustomerAddress('');
            }
        } catch (e) {
            console.error(e);
            setCustomerFound(false);
        }
    };

    // Crear cliente inline
    const createCustomer = async () => {
        if (!docNumber || !customerName) return alert('Complete documento y nombre.');

        try {
            const res = await fetch(route('admin.customers.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    doc_type: docType,
                    doc_number: docNumber,
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                    address: customerAddress,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCustomerFound(true);
                setHasSearched(true);
                alert('Cliente creado.');
                return;
            }

            if (res.status === 422) {
                const { errors } = await res.json();
                const first = Object.values(errors || {}).flat()[0] as string | undefined;
                alert(first || 'Datos inválidos.');
                return;
            }

            console.error('POST /customers error', res.status, await res.text());
            alert('No se pudo crear el cliente.');
        } catch (e) {
            console.error(e);
            alert('Error creando cliente.');
        }
    };

    const nextFromDetail = () => setStep('payment');

    const backFromPayment = () => setStep('detail');
    const goConfirm = () => {
        if (Math.abs(remaining) > 0.01) {
            alert('La suma de los pagos debe ser igual al total.');
            return;
        }
        setStep('confirm');
    };

    const submitCheckout = () => {
        if (!confirm('¿Desea grabar venta?')) return;

        const payload: any = {
            type: receiptType,
            payments: payments.map(p => ({ method: p.method, amount: Number(p.amount), reference: p.reference })),
        };

        if (docNumber) {
            payload.customer = {
            doc_type: docType,
            doc_number: docNumber,
            name: customerName || undefined,
            email: customerEmail || undefined,
            phone: customerPhone || undefined,
            address: customerAddress || undefined,
            };
        }

        // 👇 Importante: no pongas onSuccess que cierre el modal.
        // Deja que Inertia procese el Inertia::location del backend (full redirect).
        router.post(route('admin.orders.checkout', order.id), payload, {
            onError: () => alert('No se pudo grabar la venta. Revisa mensajes en la parte superior o el log.'),
        });
        };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="mx-2 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {step === 'detail' && `Pedido #${order.id} - Detalle`}
                        {step === 'payment' && `Pago de Pedido #${order.id}`}
                        {step === 'confirm' && 'Confirmación'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        ✕
                    </button>
                </div>

                {/* STEP 1: Detalle del pedido */}
                {step === 'detail' && (
                    <div>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Mesa</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{order.table?.name}</div>
                            </div>
                            <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Mesero</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{order.user?.name}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Productos</div>
                            <div className="divide-y rounded-md border dark:divide-gray-700 dark:border-gray-700">
                                {order.products.map((p) => {
                                    const price = toNum(p.pivot?.price);
                                    const qty = toInt(p.pivot?.quantity);
                                    const line = price * qty;

                                    return (
                                        <div key={p.id} className="flex items-center justify-between p-2">
                                            <div>
                                                <div className="font-medium dark:text-gray-100">{p.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    x{qty} · S/ {price.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="font-semibold dark:text-gray-100">S/ {line.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">S/ {Number(order.total).toFixed(2)}</div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={onClose} className="rounded-md bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-200">
                                Cancelar
                            </button>
                            <button onClick={nextFromDetail} className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                                Pagar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Pagos + Comprobante + Cliente */}
                {step === 'payment' && (
                    <div className="space-y-6">
                        {/* Comprobante */}
                        <div>
                            <div className="mb-1 text-sm font-medium dark:text-gray-200">Tipo de Comprobante</div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={receiptType === 'boleta'} onChange={() => setReceiptType('boleta')} />
                                    <span>Boleta</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={receiptType === 'factura'} onChange={() => setReceiptType('factura')} />
                                    <span>Factura</span>
                                </label>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="rounded-md border p-3 dark:border-gray-700">
                            <div className="mb-2 text-sm font-medium dark:text-gray-200">Cliente</div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                <div className="md:col-span-2">
                                    <select
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value as any)}
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 md:col-span-4">
                                    <input
                                        value={docNumber}
                                        onChange={(e) => handleDocChange(e.target.value)}
                                        placeholder={docType === 'DNI' ? 'DNI (8)' : 'RUC (11)'}
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                    <button onClick={searchCustomer} className="rounded-md bg-indigo-600 px-3 text-white">
                                        Buscar
                                    </button>
                                </div>
                                <div className="md:col-span-6">
                                    <input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Nombre / Razón Social"
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <input
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <input
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="Teléfono"
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <input
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        placeholder="Dirección"
                                        className="w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                </div>
                            </div>
                            {hasSearched && !customerFound && docNumber && (
                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                    No existe cliente con ese documento. Puedes crearlo aquí mismo llenando los datos.
                                    {/* <button onClick={createCustomer} className="ml-2 rounded bg-amber-600 px-2 py-1 text-white">
                                        Crear cliente
                                    </button> */}
                                </div>
                            )}
                        </div>

                        {/* Pagos */}
                        <div>
                            <div className="mb-2 text-sm font-medium dark:text-gray-200">Pagos</div>
                            <div className="space-y-2">
                                {payments.map((p, idx) => (
                                    <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-12">
                                        <div className="md:col-span-3">
                                            <select
                                                value={p.method}
                                                onChange={(e) => updatePaymentRow(idx, { method: e.target.value as any })}
                                                className="w-full rounded-md border p-2 dark:bg-gray-800"
                                            >
                                                <option value="efectivo">Efectivo</option>
                                                <option value="tarjeta">Tarjeta</option>
                                                <option value="yape">Yape</option>
                                                <option value="plin">Plin</option>
                                                <option value="transferencia">Transferencia</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={p.amount}
                                                onChange={(e) => updatePaymentRow(idx, { amount: Number(e.target.value) })}
                                                className="w-full rounded-md border p-2 dark:bg-gray-800"
                                                placeholder="Monto"
                                            />
                                        </div>
                                        <div className="md:col-span-5">
                                            <input
                                                value={p.reference || ''}
                                                onChange={(e) => updatePaymentRow(idx, { reference: e.target.value })}
                                                className="w-full rounded-md border p-2 dark:bg-gray-800"
                                                placeholder="Referencia (opcional)"
                                            />
                                        </div>
                                        <div className="flex items-center justify-end md:col-span-1">
                                            {payments.length > 1 && (
                                                <button onClick={() => removePaymentRow(idx)} className="rounded bg-red-600 px-2 py-1 text-white">
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between text-sm dark:text-gray-200">
                                <button onClick={addPaymentRow} className="rounded bg-gray-200 px-3 py-1 dark:bg-gray-700 dark:text-gray-100">
                                    Agregar pago
                                </button>
                                <div>
                                    <span className="mr-4">
                                        Pagado: <strong>S/ {sumPayments.toFixed(2)}</strong>
                                    </span>
                                    <span>
                                        Pendiente:{' '}
                                        <strong className={remaining === 0 ? 'text-green-600' : 'text-red-600'}>S/ {remaining.toFixed(2)}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={backFromPayment}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                            >
                                Atrás
                            </button>
                            <button onClick={goConfirm} className="rounded-md bg-green-600 px-4 py-2 text-sm text-white">
                                Grabar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Confirmación */}
                {step === 'confirm' && (
                    <div className="space-y-4">
                        <div className="text-center text-lg font-semibold dark:text-gray-100">¿Desea grabar venta?</div>
                        <div className="rounded-md border p-3 text-sm dark:border-gray-700 dark:text-gray-200">
                            <div>
                                <strong>Comprobante:</strong> {receiptType.toUpperCase()}
                            </div>
                            <div>
                                <strong>Cliente:</strong> {docNumber ? `${docType} ${docNumber} - ${customerName || 'Nuevo'}` : 'Sin cliente'}
                            </div>
                            <div>
                                <strong>Total:</strong> S/ {total.toFixed(2)}
                            </div>
                            <div>
                                <strong>Pagos:</strong>
                                <ul className="list-inside list-disc">
                                    {payments.map((p, i) => (
                                        <li key={i}>
                                            {p.method} — S/ {Number(p.amount).toFixed(2)} {p.reference ? `(Ref: ${p.reference})` : ''}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setStep('payment')}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                            >
                                Cancelar
                            </button>
                            <button onClick={submitCheckout} className="rounded-md bg-green-600 px-4 py-2 text-sm text-white">
                                Confirmar
                            </button>
                        </div>
                    </div>
                )}
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
    const [payingOrder, setPayingOrder] = useState<Order | null>(null);

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
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Mesa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Mesero
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
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
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                {order.table.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                {order.user.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                S/. {Number(order.total).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                {new Date(order.created_at).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    {order.status !== 'pagado' && order.status !== 'cancelado' && (
                                                        <button
                                                            onClick={() => setPayingOrder(order)}
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
            {payingOrder && <CheckoutModal order={payingOrder} onClose={() => setPayingOrder(null)} />}
        </AppLayout>
    );
}
