import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

interface Role {
  id: number;
  name: string;
  permissions_count: number;
}
interface Props {
  filters: { search?: string };
  roles: {
    data: Role[];
    links: { url: string | null; label: string; active: boolean }[];
  };
}

export default function Index({ filters, roles }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('admin.roles.index'), { search }, { preserveState: true, preserveScroll: true });
  };

  const remove = (id: number) => {
    if (!confirm('¿Eliminar rol?')) return;
    router.delete(route('admin.roles.destroy', id));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Roles', href: route('admin.roles.index') }]}>
      <Head title="Roles" />
      <div className="py-12">
        <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-gray-100">Roles</h2>
              <Link href={route('admin.roles.create')} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                Nuevo Rol
              </Link>
            </div>

            <form onSubmit={doSearch} className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-md border p-2 dark:bg-gray-800"
              />
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-300">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-300"># Permisos</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {roles.data.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2 text-sm dark:text-gray-100">{r.name}</td>
                      <td className="px-4 py-2 text-sm dark:text-gray-100">{r.permissions_count}</td>
                      <td className="px-4 py-2 text-right">
                        <Link href={route('admin.roles.edit', r.id)} className="mr-2 text-indigo-600 hover:underline">
                          Editar
                        </Link>
                        <button onClick={() => remove(r.id)} className="text-red-600 hover:underline">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación simple */}
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.links.map((l, i) => (
                <button
                  key={i}
                  disabled={!l.url}
                  onClick={() => l.url && router.get(l.url)}
                  className={`rounded border px-3 py-1 text-sm ${l.active ? 'bg-indigo-600 text-white' : 'dark:text-gray-100'}`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
