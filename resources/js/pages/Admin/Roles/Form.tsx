import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

type Permission = { id: number; name: string; guard_name: string };

interface Props {
  mode: 'create' | 'edit';
  role: { id: number; name: string; permissions: number[] } | null;
  permissions: Permission[];
}

export default function Form({ mode, role, permissions }: Props) {
  const [name, setName] = useState(role?.name ?? '');
  const [selected, setSelected] = useState<number[]>(role?.permissions ?? []);

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, permissions: selected };

    if (mode === 'create') {
      router.post(route('admin.roles.store'), data);
    } else {
      router.put(route('admin.roles.update', role!.id), data);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Roles', href: route('admin.roles.index') }, { title: mode === 'create' ? 'Nuevo' : 'Editar', href: '#' }]}>
      <Head title={mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'} />
      <div className="py-12">
        <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">{mode === 'create' ? 'Crear Rol' : 'Editar Rol'}</h2>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm dark:text-gray-200">Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border p-2 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold dark:text-gray-200">Permisos</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {permissions.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 rounded border p-2 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="text-sm dark:text-gray-100">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Link href={route('admin.roles.index')} className="rounded-md bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                  Cancelar
                </Link>
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
