import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, FileIcon, ExternalLinkIcon, CheckCircleIcon, DownloadIcon, EyeIcon, FileTextIcon, ImageIcon } from "lucide-react"
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
    const [previewFile, setPreviewFile] = useState<Archivo | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
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

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return <FileTextIcon className="h-4 w-4 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <ImageIcon className="h-4 w-4 text-blue-500" />;
            case 'doc':
            case 'docx':
                return <FileTextIcon className="h-4 w-4 text-blue-600" />;
            case 'xls':
            case 'xlsx':
                return <FileTextIcon className="h-4 w-4 text-green-600" />;
            default:
                return <FileIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const isImageFile = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    };

    const isPdfFile = (fileName: string) => {
        return fileName.toLowerCase().endsWith('.pdf');
    };

    const handlePreviewFile = (archivo: Archivo) => {
        setPreviewFile(archivo);
        setIsPreviewOpen(true);
    };

    /* const handleDownloadFile = async (archivo: Archivo) => {
        try {
            const response = await fetch(archivo.url_archivo);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = archivo.nombre_archivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }; */

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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

                        {/* Archivos con Preview */}
                        {currentObra.archivos && currentObra.archivos.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileIcon className="h-4 w-4" />
                                    Archivos ({currentObra.archivos.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentObra.archivos.map((archivo) => (
                                        <div 
                                            key={archivo.archivo_id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            {/* Vista previa del archivo */}
                                            <div className="mb-3">
                                                {isImageFile(archivo.nombre_archivo) ? (
                                                    <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
                                                        <img
                                                            src={archivo.url_archivo}
                                                            alt={archivo.nombre_archivo}
                                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                                            onClick={() => handlePreviewFile(archivo)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                                                        <div className="text-center">
                                                            {getFileIcon(archivo.nombre_archivo)}
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {archivo.nombre_archivo.split('.').pop()?.toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del archivo */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(archivo.nombre_archivo)}
                                                    <span className="text-sm font-medium truncate">
                                                        {archivo.nombre_archivo}
                                                    </span>
                                                </div>

                                                {/* Botones de acción */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePreviewFile(archivo)}
                                                        className="flex items-center gap-1 flex-1"
                                                    >
                                                        <EyeIcon className="h-3 w-3" />
                                                        Vista
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Solicitudes de Material */}

                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Vista Previa */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewFile && getFileIcon(previewFile.nombre_archivo)}
                            {previewFile?.nombre_archivo}
                        </DialogTitle>
                        <DialogDescription>
                            Vista previa del archivo
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        {previewFile && (
                            <div className="h-96 bg-gray-50 rounded overflow-hidden">
                                {isImageFile(previewFile.nombre_archivo) ? (
                                    <img
                                        src={previewFile.url_archivo}
                                        alt={previewFile.nombre_archivo}
                                        className="w-full h-full object-contain"
                                    />
                                ) : isPdfFile(previewFile.nombre_archivo) ? (
                                    <iframe
                                        src={previewFile.url_archivo}
                                        className="w-full h-full"
                                        title={previewFile.nombre_archivo}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            {getFileIcon(previewFile.nombre_archivo)}
                                            <p className="text-gray-500 mt-2">
                                                Vista previa no disponible para este tipo de archivo
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(previewFile.url_archivo, '_blank')}
                                                className="mt-2"
                                            >
                                                Abrir en nueva ventana
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => previewFile && window.open(previewFile.url_archivo, '_blank')}
                        >
                            Abrir en nueva ventana
                        </Button>
                        {/* <Button
                            variant="outline"
                            onClick={() => previewFile && handleDownloadFile(previewFile)}
                        >
                            Descargar
                        </Button> */}
                        <Button onClick={() => setIsPreviewOpen(false)}>
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
