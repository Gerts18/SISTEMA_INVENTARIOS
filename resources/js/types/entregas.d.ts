export interface EntregaObra {
    obra_id: number;
    nombre: string;
}

export interface EntregaUsuario {
    id: number;
    name: string;
    role?: string;
}

export interface EntregaTransicion {
    transicion_id: number;
    estado: 'no_recibido' | 'recibido' | 'faltante';
    comentario: string | null;
    fecha: string;
    es_devolucion: boolean;
    created_at: string;
    remitente: EntregaUsuario;
    destinatario: EntregaUsuario;
}

export interface Entrega {
    entrega_id: number;
    titulo: string;
    descripcion: string | null;
    estado_general: 'en_curso' | 'completado';
    created_at: string;
    obra: EntregaObra;
    creador: EntregaUsuario;
    transicion_actual: EntregaTransicion | null;
    es_mi_entrega: boolean;
}

export interface PaginatedEntregas {
    data: Entrega[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface EntregasPageProps {
    entregas: PaginatedEntregas;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
    userRole: string;
}

export interface EntregaDetalle {
    entrega_id: number;
    titulo: string;
    descripcion: string | null;
    estado_general: 'en_curso' | 'completado';
    created_at: string;
    obra: EntregaObra;
    creador: EntregaUsuario;
}
