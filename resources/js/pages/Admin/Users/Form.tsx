import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Role = { id: number; name: string };

interface Props {
    mode: 'create' | 'edit';
    user: null | {
        id: number;
        name: string;
        email: string;
        roles: number[];
        deleted_at?: string | null;
    };
    roles: Role[];
}

export default function Form({ mode, user, roles }: Props) {
    const isEdit = mode === 'edit';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: route('admin.users.index') },
        { title: isEdit ? 'Editar' : 'Crear', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        roles: (user?.roles ?? []) as number[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && user) {
            put(route('admin.users.update', user.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    const toggleRole = (id: number) => {
        setData((form) => {
            const roles = Array.isArray(form.roles) ? form.roles : [];
            return {
                ...form,
                roles: roles.includes(id) ? roles.filter((x) => x !== id) : [...roles, id],
            };
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar usuario' : 'Nuevo usuario'} />
            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-200">Nombre</label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-200">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-200">
                                        {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-200">Confirmación</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-1 w-full rounded-md border p-2 dark:bg-gray-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 text-sm font-medium dark:text-gray-200">Roles</div>
                                <div className="flex flex-wrap gap-2">
                                    {roles.map((r) => {
                                        const active = (data.roles as number[]).includes(r.id);
                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => toggleRole(r.id)}
                                                className={`rounded border px-3 py-1 ${active ? 'bg-indigo-600 text-white' : 'dark:text-gray-100'}`}
                                            >
                                                {r.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
                            </div>

                            <div className="flex justify-between">
                                <Link href={route('admin.users.index')} className="rounded bg-gray-200 px-4 py-2 dark:bg-gray-700 dark:text-gray-100">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
