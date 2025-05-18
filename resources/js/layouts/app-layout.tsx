import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <div className="absolute top-4 left-4 z-50">
                <SidebarTrigger className="-ml-1" />
            </div>
            {children}
    </AppLayoutTemplate>
);
