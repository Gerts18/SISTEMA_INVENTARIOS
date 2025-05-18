import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {PageProps} from '@/types/auth'


export function NavMain({ items = [] }: { items: NavItem[] }) {
    //Obteniendo props de Inertia
    const page = usePage<PageProps>();
 
    const userRole = page.props.auth?.role;

    // Filtra los items según los roles del usuario (soporta varios roles)
    const filteredItems = items.filter(item => {
        if (!item.permissions) return true;
        if (item.permissions.startsWith('role:')) {
            const requiredRoles = item.permissions
                .replace('role:', '')
                .split('|')
                .map(r => r.trim().toLowerCase());
            const currentRole = (userRole ?? '').trim().toLowerCase();
            return requiredRoles.includes(currentRole);
        }
        return true;
    });

    return (
        <SidebarGroup className="px-2 py-0">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton  
                            asChild isActive={item.href === page.url}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
