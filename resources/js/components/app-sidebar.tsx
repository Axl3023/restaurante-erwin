import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types'; // Asegúrate que SharedData incluya los roles del usuario
import { Link, usePage } from '@inertiajs/react';
// arriba, donde importas íconos
import { BookOpen, Folder, LayoutGrid, Printer, Tags, Utensils, Table, ShoppingCart, Shield } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    // Obtenemos los datos del usuario, incluyendo sus roles, desde las props compartidas de Inertia
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth.user?.roles ?? [];

    // --- Construimos la navegación principal dinámicamente según el rol ---
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Solo los Meseros y Administradores ven el Punto de Venta
    if (userRoles.includes('Administrador') || userRoles.includes('Mesero')) {
        mainNavItems.push({
            title: 'Punto de Venta',
            href: route('pos.index'),
            icon: Printer,
        });
    }

    // Solo los Administradores ven la gestión de Categorías y Productos
    if (userRoles.includes('Administrador')) {
        mainNavItems.push({
            title: 'Categorías',
            href: route('admin.categories.index'),
            icon: Tags,
        });
        mainNavItems.push({
            title: 'Productos',
            href: route('admin.products.index'),
            icon: Utensils,
        });
        mainNavItems.push({
            title: 'Mesas',
            href: route('admin.tables.index'),
            icon: Table,
        });
        mainNavItems.push({
            title: 'Pedidos',
            href: route('admin.orders.index'),
            icon: ShoppingCart,
        });
        mainNavItems.push({
            title: 'Roles',
            href: route('admin.roles.index'),
            icon: Shield,
        });

    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
