import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface HistorialRegistro {
    id: number;
    fecha_cambio: string;
    precio_lista: string;
    precio_publico: string;
    tipo_cambio: string;
    created_at: string;
}

interface ProductoInfo {
    producto_id: string;
    nombre: string;
    codigo: string;
    precio_lista: number;
    precio_publico: number;
}

interface PriceHistoryProps {
    productoId: string;
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({ productoId }) => {
    const [historial, setHistorial] = useState<HistorialRegistro[]>([]);
    const [producto, setProducto] = useState<ProductoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/inventario/productos/${productoId}/historial-precios`);

                if (response.data.success) {
                    setHistorial(response.data.historial);
                    setProducto(response.data.producto);
                } else {
                    setError('Error al cargar el historial');
                }
            } catch (error: any) {
                setError(error.response?.data?.message || 'Error al cargar el historial de precios');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistorial();
    }, [productoId]);

    const getTipoCambioColor = (tipo: string) => {
        switch (tipo) {
            case 'creacion':
                return 'bg-blue-100 text-blue-800';
            case 'actualizacion':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTipoCambioText = (tipo: string) => {
        switch (tipo) {
            case 'creacion':
                return 'Creación';
            case 'actualizacion':
                return 'Actualización';
            default:
                return tipo;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando historial...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {producto && (
                <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Código:</span>
                            <span className="ml-2 font-medium">{producto.codigo}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Precio Lista Actual:</span>
                            <span className="ml-2 font-medium">${producto.precio_lista}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Precio Público Actual:</span>
                            <span className="ml-2 font-medium">${producto.precio_publico}</span>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h4 className="font-medium mb-3">Historial de Cambios de Precios</h4>

                {historial.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No hay historial de cambios de precios disponible
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {historial.map((registro) => (
                            <div key={registro.id} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Badge className={getTipoCambioColor(registro.tipo_cambio)}>
                                        {getTipoCambioText(registro.tipo_cambio)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(registro.created_at).toLocaleString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Precio Lista:</span>
                                        <span className="ml-2 font-medium">${registro.precio_lista}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Precio Público:</span>
                                        <span className="ml-2 font-medium">${registro.precio_publico}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
