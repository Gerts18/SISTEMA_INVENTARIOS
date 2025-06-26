import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

import { PageProps } from '@/types/auth'
import {usePage } from '@inertiajs/react'

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function InicioPage({ auth }: Props) {

    const page = usePage<PageProps>();
    const userRole = page.props.auth?.role;

    return (
        <AppLayout>
            <Head title="Inicio" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div> */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-8 flex flex-col items-center text-center">
                        <h1 className="text-3xl font-bold mb-4">¡Bienvenido, {auth.user.name}!</h1>
                        <img
                            src="/logo.png"
                            alt="Grupo Hanfer"
                            className="h-auto mb-8"
                        />

                        <p className="text-gray-600 dark:text-gray-300">
                            Sistema de gestión de inventario.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            Tienes el rol de {userRole}.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
