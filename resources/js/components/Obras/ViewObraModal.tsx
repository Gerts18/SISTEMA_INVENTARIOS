import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, FileIcon, ExternalLinkIcon, CheckCircleIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"

interface Archivo {
    archivo_id: number;
    nombre_archivo: string;
    url_archivo: string;
}

interface Obra {
    obra_id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
    archivos: Archivo[];
}

interface ViewObraModalProps {
    obra: Obra | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ViewObraModal({ obra, isOpen, onClose }: ViewObraModalProps) {
    const [currentObra, setCurrentObra] = useState<Obra | null>(obra);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    
    const { props } = usePage();

    // Actualizar currentObra cuando obra cambie
    useEffect(() => {
        setCurrentObra(obra);
    }, [obra]);

    // Manejar mensajes de éxito/error de la sesión
    useEffect(() => {
        if (props.success) {
            setUpdateMessage(props.success as string);
            setIsUpdating(false);
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                setUpdateMessage(null);
            }, 3000);
        } else if (props.error) {
            setUpdateMessage(props.error as string);
            setIsUpdating(false);
            
            // Limpiar mensaje después de 5 segundos para errores
            setTimeout(() => {
                setUpdateMessage(null);
            }, 5000);
        }
    }, [props.success, props.error]);

    // Limpiar mensaje cuando se cierre el modal
    useEffect(() => {
        if (!isOpen) {
            setUpdateMessage(null);
        }
    }, [isOpen]);

    if (!currentObra) return null;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'en_progreso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completada':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoText = (estado: string) => {
        switch (estado) {
            case 'en_progreso':
                return 'En Progreso';
            case 'completada':
                return 'Completada';
            case 'pendiente':
                return 'Pendiente';
            default:
                return estado;
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        setUpdateMessage(null);

        router.patch(`/obras/${currentObra.obra_id}/status`, 
            { estado: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['obras'],
                onSuccess: (page) => {
                    // Buscar la obra actualizada en la respuesta
                    const updatedObras = page.props.obras as Obra[];
                    const updatedObra = updatedObras.find(o => o.obra_id === currentObra.obra_id);
                    
                    if (updatedObra) {
                        setCurrentObra(updatedObra);
                    }
                    
                    setUpdateMessage('Estado actualizado correctamente.');
                    setIsUpdating(false);
                    
                    // Limpiar mensaje después de 3 segundos
                    setTimeout(() => {
                        setUpdateMessage(null);
                    }, 3000);
                },
                onError: (errors) => {
                    setUpdateMessage('Error al actualizar el estado.');
                    setIsUpdating(false);
                },
                onFinish: () => {
                    setIsUpdating(false);
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{currentObra.nombre}</DialogTitle>
                    <DialogDescription>
                        Detalles completos de la obra
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {updateMessage && (
                        <Alert className={updateMessage.includes('Error') ? 'border-red-400 bg-red-50 text-red-700' : 'border-green-400 bg-green-50 text-green-700'}>
                            <AlertDescription>{updateMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Estado y Selector */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Badge className={getEstadoColor(currentObra.estado)}>
                                {getEstadoText(currentObra.estado)}
                            </Badge>
                            {currentObra.estado === 'completada' && (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            )}
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Cambiar Estado
                            </label>
                            <Select 
                                value={currentObra.estado} 
                                onValueChange={handleStatusChange}
                                disabled={isUpdating}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                                    <SelectItem value="completada">Completada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Descripción */}
                    {currentObra.descripcion && (
                        <div>
                            <h3 className="font-semibold mb-2">Descripción</h3>
                            <p className="text-muted-foreground">{currentObra.descripcion}</p>
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Fecha de Inicio
                            </h3>
                            <p className="text-muted-foreground">
                                {new Date(currentObra.fecha_inicio).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                        {currentObra.fecha_fin && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    Fecha de Finalización
                                </h3>
                                <p className="text-muted-foreground">
                                    {new Date(currentObra.fecha_fin).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Archivos */}
                    {currentObra.archivos && currentObra.archivos.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FileIcon className="h-4 w-4" />
                                Archivos ({currentObra.archivos.length})
                            </h3>
                            <div className="space-y-2">
                                {currentObra.archivos.map((archivo) => (
                                    <div 
                                        key={archivo.archivo_id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium">
                                                {archivo.nombre_archivo}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(archivo.url_archivo, '_blank')}
                                            className="flex items-center gap-1"
                                        >
                                            <ExternalLinkIcon className="h-3 w-3" />
                                            Abrir
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Solicitudes de Material */}

                </div>
            </DialogContent>
        </Dialog>
    );
}
