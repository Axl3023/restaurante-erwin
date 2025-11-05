import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, Trash2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Entradas', href: route('admin.entries.index') },
];

interface EntryRow {
  id: number;
  entry_date: string;
  supplier: string;
  total: number;
}

interface IndexProps {
  entries: {
    data: EntryRow[];
    links: { url: string | null; label: string; active: boolean }[];
  };
  flash?: { success?: string };
}

function DeleteEntryModal({
  entry,
  onClose,
}: {
  entry: EntryRow;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const submitDelete = () => {
    setProcessing(true);
    router.delete(route('admin.entries.destroy', entry.id), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: onClose,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Confirmar eliminación
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Se eliminará la entrada del <b>{entry.entry_date}</b> (Proveedor: {entry.supplier}) y
          <b> se revertirá el stock afectado</b>. ¿Deseas continuar?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={submitDelete}
            disabled={processing}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {processing ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index({ entries, flash }: IndexProps) {
  const [deleting, setDeleting] = useState<EntryRow | null>(null);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Entradas de Almacén" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Historial de Entradas
            </h1>
            <a
              href={route('admin.entries.create')}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Nueva entrada
            </a>
          </div>

          {flash?.success && (
            <div className="rounded bg-green-100 p-3 text-green-800 dark:bg-green-900/40 dark:text-green-100">
              {flash.success}
            </div>
          )}

          {/* Table */}
          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {entries.data.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {e.entry_date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {e.supplier}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                        S/ {Number(e.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-3">
                          <a
                            href={route('admin.entries.edit', e.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => setDeleting(e)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación simple */}
            <div className="mt-4 flex flex-wrap gap-2">
              {entries.links.map((lnk) => (
                <a
                  key={lnk.label + lnk.url}
                  href={lnk.url ?? '#'}
                  dangerouslySetInnerHTML={{ __html: lnk.label }}
                  className={`px-3 py-1 text-sm rounded ${
                    lnk.active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {deleting && (
        <DeleteEntryModal entry={deleting} onClose={() => setDeleting(null)} />
      )}
    </AppLayout>
  );
}
