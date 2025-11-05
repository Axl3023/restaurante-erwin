import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, BookOpen, Folder, LayoutGrid, Printer, Shield, ShoppingCart, Table, Tags, Users, Utensils, Warehouse } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth.user?.roles ?? [];

    const mainNavItems: NavItem[] = [{ title: 'Dashboard', href: dashboard().url, icon: LayoutGrid }];

    if (userRoles.includes('Administrador') || userRoles.includes('Mesero')) {
        mainNavItems.push({ title: 'Punto de Venta', href: route('pos.index'), icon: Printer });
    }

    if (userRoles.includes('Administrador')) {
        mainNavItems.push(
            { title: 'Categorías', href: route('admin.categories.index'), icon: Tags },
            { title: 'Productos', href: route('admin.products.index'), icon: Utensils },
            { title: 'Mesas', href: route('admin.tables.index'), icon: Table },
            { title: 'Pedidos', href: route('admin.orders.index'), icon: ShoppingCart },
            { title: 'Roles', href: route('admin.roles.index'), icon: Shield },
            { title: 'Usuarios', href: route('admin.users.index'), icon: Users },
            { title: 'Almacén', href: route('admin.entries.index'), icon: Warehouse },
            {
                title: 'Reportes',
                icon: BarChart3,
                // ojo: SIN href -> será desplegable
                items: [
                    { title: 'Ventas', href: route('admin.reports.sales') },
                    { title: 'Existencias', href: '#', disabled: true },
                ],
            },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
