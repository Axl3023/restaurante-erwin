import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

export function NavMain({ items = [] }: { items: (NavItem | null | undefined)[] }) {
    const page = usePage() as any;
    const currentUrl: string = page?.url ?? '';

    const isActiveHref = (href?: NavItem['href']) => {
        if (!href) return false;
        const s = typeof href === 'string' ? href : href.url;
        return typeof s === 'string' ? currentUrl.startsWith(s) : false;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {(items ?? [])
                    .filter((it): it is NavItem => !!it)
                    .map((item, idx) => {
                        const hasChildren = Array.isArray(item.items) && item.items.length > 0;

                        // Si tiene hijos: renderiza como colapsable
                        if (hasChildren) {
                            const childActive = item.items!.some((c) => isActiveHref(c.href));
                            const [open, setOpen] = React.useState(childActive);

                            return (
                                <SidebarMenuItem key={`grp-${idx}`}>
                                    <SidebarMenuButton
                                        isActive={childActive}
                                        onClick={() => setOpen((v) => !v)}
                                        // No usamos asChild: es un botón, no un Link
                                    >
                                        {item.icon ? <item.icon /> : null}
                                        <span>{item.title}</span>
                                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </SidebarMenuButton>

                                    {open && (
                                        <div className="mt-1 ml-6 flex flex-col gap-1">
                                            {item.items!.map((child, cidx) => {
                                                const disabled = !!child.disabled;
                                                return (
                                                    <SidebarMenuButton
                                                        key={`child-${idx}-${cidx}`}
                                                        asChild
                                                        isActive={isActiveHref(child.href)}
                                                        className={`justify-start ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                                                    >
                                                        <Link href={disabled ? '#' : child.href}>{child.title}</Link>
                                                    </SidebarMenuButton>
                                                );
                                            })}
                                        </div>
                                    )}
                                </SidebarMenuItem>
                            );
                        }

                        // Ítem simple (link normal). Si no tiene href, lo omitimos.
                        if (!item.href) return null;

                        return (
                            <SidebarMenuItem key={`itm-${idx}`}>
                                <SidebarMenuButton asChild isActive={isActiveHref(item.href)} tooltip={{ children: item.title }}>
                                    <Link href={item.href}>
                                        {item.icon ? <item.icon /> : null}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;
