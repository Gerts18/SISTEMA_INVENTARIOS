import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook que suscribe al usuario al canal privado de Entregas via WebSocket.
 * Cuando llega un evento, recarga automáticamente la lista de entregas.
 */
export function useEntregasChannel(userId: number | undefined) {
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channelName = `entregas.user.${userId}`;

        const channel = window.Echo.private(channelName);

        channel.listen('.EntregaActualizada', () => {
            // Recarga solo el prop 'entregas' de la página actual via Inertia
            router.reload({ only: ['entregas'] });
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [userId]);
}
