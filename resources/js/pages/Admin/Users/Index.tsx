import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

type Role = { id: number; name: string };
type UserItem = {
    id: number;
    name: string;
    email: string;
    deleted_at?: string | null;
    roles: Role[];
};

interface Props {
    filters: { search: string };
    users: {
        data: UserItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: route('admin.users.index') }];

export default function Index({ filters, users }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true, replace: true });
    };

    const destroyUser = (u: UserItem) => {
        if (!confirm(`¿Eliminar a ${u.name}?`)) return;
        router.delete(route('admin.users.destroy', u.id));
    };

    const restoreUser = (u: UserItem) => {
        router.patch(route('admin.users.restore', u.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <form onSubmit={doSearch} className="flex gap-2">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre o email"
                                    className="w-64 rounded-md border p-2 dark:bg-gray-800"
                                />
                                <button className="rounded-md bg-indigo-600 px-3 py-2 text-white">Buscar</button>
                            </form>

                            <Link href={route('admin.users.create')} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                Nuevo Usuario
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Nombre</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Email</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Roles</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.data.map((u) => (
                                        <tr key={u.id} className={u.deleted_at ? 'opacity-60' : ''}>
                                            <td className="px-4 py-2 text-sm dark:text-gray-100">{u.name}</td>
                                            <td className="px-4 py-2 text-sm dark:text-gray-100">{u.email}</td>
                                            <td className="px-4 py-2 text-sm dark:text-gray-100">{u.roles.map((r) => r.name).join(', ') || '—'}</td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.users.edit', u.id)}
                                                        className="rounded bg-indigo-600 px-3 py-1 text-white"
                                                    >
                                                        Editar
                                                    </Link>
                                                    {u.deleted_at ? (
                                                        <button
                                                            onClick={() => restoreUser(u)}
                                                            className="rounded bg-emerald-600 px-3 py-1 text-white"
                                                        >
                                                            Restaurar
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => destroyUser(u)} className="rounded bg-red-600 px-3 py-1 text-white">
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación simple */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {users.links.map((l, i) => (
                                <Link
                                    key={i}
                                    href={l.url || '#'}
                                    className={`rounded border px-3 py-1 ${l.active ? 'bg-indigo-600 text-white' : 'dark:text-gray-100'}`}
                                    preserveScroll
                                >
                                    <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
