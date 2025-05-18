import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {PageProps} from '@/types/auth'


export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage<PageProps>();
    //console.log('auth:', page.props.auth);
    const userRole = page.props.auth?.role;
    //console.log('userRole:', userRole);

    // Filtra los items según el rol del usuario
    const filteredItems = items.filter(item => {
        if (!item.permissions) return true;
        if (item.permissions.startsWith('role:')) {
            const requiredRole = item.permissions.replace('role:', '').trim().toLowerCase();
            const currentRole = (userRole ?? '').trim().toLowerCase();
           // console.log('requiredRole:', requiredRole, 'userRole:', currentRole);
            return currentRole === requiredRole;
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
