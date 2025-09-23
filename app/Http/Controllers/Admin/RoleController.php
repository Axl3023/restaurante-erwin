<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $search = (string) $request->get('search', '');

        $roles = Role::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->withCount('permissions')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Roles/Index', [
            'filters' => ['search' => $search],
            'roles'   => $roles,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Roles/Form', [
            'mode'        => 'create',
            'role'        => null,
            'permissions' => Permission::orderBy('name')->get(['id','name','guard_name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255|unique:roles,name',
            'permissions'  => 'array',
            'permissions.*'=> 'integer|exists:permissions,id',
        ]);

        $role = Role::create(['name' => $data['name']]);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return redirect()->route('admin.roles.index')->with('success', 'Rol creado.');
    }

    public function edit(Role $role)
    {
        return Inertia::render('Admin/Roles/Form', [
            'mode'        => 'edit',
            'role'        => [
                'id'   => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('id'),
            ],
            'permissions' => Permission::orderBy('name')->get(['id','name','guard_name']),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name'         => "required|string|max:255|unique:roles,name,{$role->id}",
            'permissions'  => 'array',
            'permissions.*'=> 'integer|exists:permissions,id',
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('admin.roles.index')->with('success', 'Rol actualizado.');
    }

    public function destroy(Role $role)
    {
        // Evita borrar el rol base si quieres:
        // if (in_array($role->name, ['Administrador'])) { ... }

        $role->delete();
        return redirect()->route('admin.roles.index')->with('success', 'Rol eliminado.');
    }
}

