import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, FileIcon, ExternalLinkIcon } from "lucide-react"

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
    if (!obra) return null;

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{obra.nombre}</DialogTitle>
                    <DialogDescription>
                        Detalles completos de la obra
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Estado */}
                    <div>
                        <Badge className={getEstadoColor(obra.estado)}>
                            {getEstadoText(obra.estado)}
                        </Badge>
                    </div>

                    {/* Descripción */}
                    {obra.descripcion && (
                        <div>
                            <h3 className="font-semibold mb-2">Descripción</h3>
                            <p className="text-muted-foreground">{obra.descripcion}</p>
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
                                {new Date(obra.fecha_inicio).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                        {obra.fecha_fin && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    Fecha de Fin
                                </h3>
                                <p className="text-muted-foreground">
                                    {new Date(obra.fecha_fin).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Archivos */}
                    {obra.archivos && obra.archivos.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FileIcon className="h-4 w-4" />
                                Archivos ({obra.archivos.length})
                            </h3>
                            <div className="space-y-2">
                                {obra.archivos.map((archivo) => (
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
