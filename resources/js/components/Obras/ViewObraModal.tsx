import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, FileIcon, ExternalLinkIcon, CheckCircleIcon, DownloadIcon, EyeIcon, FileTextIcon, ImageIcon, UserIcon, ClipboardListIcon, PlusIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"
import { ViewSolicitudModal } from "./ViewSolicitudModal"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from "axios"

interface Archivo {
    archivo_id: number;
    nombre_archivo: string;
    url_archivo: string;
}

interface Registro {
    id: number;
    fecha: string;
    concepto: string;
    created_at: string;
}

interface Obra {
    obra_id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
    archivos: Archivo[];
    registros?: Registro[];
}

interface ViewObraModalProps {
    obra: Obra | null;
    isOpen: boolean;
    onClose: () => void;
}

interface Solicitud {
    solicitud_id: number;
    fecha_solicitud: string;
    concepto: string;
    reporte_generado_url: string | null;
    created_at: string;
    usuario_name: string;
    usuario_id: number;
}

export function ViewObraModal({ obra, isOpen, onClose }: ViewObraModalProps) {
    const [currentObra, setCurrentObra] = useState<Obra | null>(obra);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<Archivo | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
    const [isSolicitudModalOpen, setIsSolicitudModalOpen] = useState(false);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [loadingRegistros, setLoadingRegistros] = useState(false);
    const [newRegistro, setNewRegistro] = useState({ fecha: new Date().toISOString().split('T')[0], concepto: '' });
    const [isAddingRegistro, setIsAddingRegistro] = useState(false);
    
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

    // Fetch solicitudes when obra changes
    useEffect(() => {
        if (currentObra && isOpen) {
            fetchSolicitudes();
        }
    }, [currentObra, isOpen]);

    const fetchSolicitudes = async () => {
        if (!currentObra) return;
        
        try {
            setLoadingSolicitudes(true);
            const response = await axios.get(`/obras/${currentObra.obra_id}/solicitudes`);
            
            if (response.data.success) {
                setSolicitudes(response.data.solicitudes);
            }
        } catch (error) {
            console.error('Error fetching solicitudes:', error);
        } finally {
            setLoadingSolicitudes(false);
        }
    };

    // Fetch registros cuando obra cambia
    useEffect(() => {
        if (currentObra && isOpen) {
            fetchRegistros();
        }
    }, [currentObra, isOpen]);

    const fetchRegistros = async () => {
        if (!currentObra) return;
        
        try {
            setLoadingRegistros(true);
            const response = await axios.get(`/obras/${currentObra.obra_id}/registros`);
            
            if (response.data.success) {
                setRegistros(response.data.registros);
            }
        } catch (error) {
            console.error('Error fetching registros:', error);
        } finally {
            setLoadingRegistros(false);
        }
    };

    const handleViewSolicitud = (solicitud: Solicitud) => {
        setSelectedSolicitud(solicitud);
        setIsSolicitudModalOpen(true);
    };

    const handleAddRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newRegistro.concepto.trim() || !currentObra) return;

        try {
            setIsAddingRegistro(true);
            const response = await axios.post(`/obras/${currentObra.obra_id}/registros`, newRegistro);
            
            if (response.data.success) {
                setNewRegistro({ fecha: new Date().toISOString().split('T')[0], concepto: '' });
                fetchRegistros(); // Refresh registros list
                setUpdateMessage('Registro agregado correctamente.');
                setTimeout(() => setUpdateMessage(null), 3000);
            } else {
                setUpdateMessage('Error al agregar el registro.');
                setTimeout(() => setUpdateMessage(null), 5000);
            }
        } catch (error) {
            console.error('Error adding registro:', error);
            setUpdateMessage('Error al agregar el registro.');
            setTimeout(() => setUpdateMessage(null), 5000);
        } finally {
            setIsAddingRegistro(false);
        }
    };

    if (!currentObra) return null;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'en_progreso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'finalizada':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoText = (estado: string) => {
        switch (estado) {
            case 'en_progreso':
                return 'En Progreso';
            case 'finalizada':
                return 'Finalizada';
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
                            {currentObra.estado === 'finalizada' && (
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
                                        <SelectItem value="en_progreso">En Progreso</SelectItem>
                                        <SelectItem value="finalizada">Finalizada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descripción */}
                        {currentObra.descripcion && (
                            <div>
                                <h3 className="font-semibold mb-2">Descripción</h3>
                                <Textarea
                                    readOnly
                                    value={currentObra.descripcion}
                                    rows={5}
                                    className="w-full max-w-full resize-y bg-gray-50 border text-sm leading-relaxed"
                                    style={{ overflowWrap: 'anywhere' }}
                                />
                            </div>
                        )}

                        {/* Registros de Obra */}
                        <div className="space-y-4 ">
                            <h3 className="font-semibold flex items-center gap-2">
                                <ClipboardListIcon className="h-4 w-4" />
                                Registros de Obra
                            </h3>

                            {/* Formulario para agregar registro */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <PlusIcon className="h-4 w-4" />
                                        Agregar Nuevo Registro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddRegistro} className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">
                                                    Fecha
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={newRegistro.fecha}
                                                    onChange={(e) => setNewRegistro(prev => ({ ...prev, fecha: e.target.value }))}
                                                    required
                                                    disabled={isAddingRegistro}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium mb-1 block">
                                                    Concepto
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Descripción del registro..."
                                                    value={newRegistro.concepto}
                                                    onChange={(e) => setNewRegistro(prev => ({ ...prev, concepto: e.target.value }))}
                                                    required
                                                    disabled={isAddingRegistro}
                                                    maxLength={100}
                                                    className={newRegistro.concepto.length > 100 ? "border-red-500 focus:border-red-500" : ""}
                                                />
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className={`text-xs ${newRegistro.concepto.length > 100 ? 'text-red-500' : newRegistro.concepto.length > 90 ? 'text-orange-500' : 'text-gray-500'}`}>
                                                        {newRegistro.concepto.length}/100 caracteres
                                                    </span>
                                                    {newRegistro.concepto.length > 100 && (
                                                        <span className="text-xs text-red-500">
                                                            Máximo 100 caracteres
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={isAddingRegistro || !newRegistro.concepto.trim() || newRegistro.concepto.length > 100}
                                            size="sm"
                                        >
                                            {isAddingRegistro ? 'Agregando...' : 'Agregar Registro'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Tabla de registros */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Historial de Registros
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingRegistros ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">Cargando registros...</p>
                                        </div>
                                    ) : registros.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Fecha</TableHead>
                                                    <TableHead className="w-[200px]">Concepto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {registros.map((registro) => (
                                                    <TableRow key={registro.id}>
                                                        <TableCell className="font-medium align-top whitespace-nowrap w-[120px]">
                                                            {new Date(registro.fecha).toLocaleDateString('es-ES')}
                                                        </TableCell>
                                                        <TableCell className="align-top w-[200px] max-w-[200px]">
                                                            <div className="break-words whitespace-normal hyphens-auto leading-relaxed text-sm">
                                                                {registro.concepto}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-6">
                                            <ClipboardListIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No hay registros para esta obra</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

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
                                        Fecha Estimada de Finalización
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
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <ClipboardListIcon className="h-4 w-4" />
                                Solicitudes de Material
                            </h3>
                            
                            {loadingSolicitudes ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">Cargando solicitudes...</p>
                                </div>
                            ) : solicitudes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {solicitudes.map((solicitud) => (
                                        <Card key={solicitud.solicitud_id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base">
                                                        Solicitud #{solicitud.solicitud_id}
                                                    </CardTitle>
                                                    <Badge variant={solicitud.reporte_generado_url ? "default" : "secondary"} className="text-xs">
                                                        {solicitud.reporte_generado_url ? "Con PDF" : "Sin PDF"}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    <span>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <UserIcon className="h-3 w-3" />
                                                    <span className="truncate">{solicitud.usuario_name}</span>
                                                </div>
                                                
                                                <div className="pt-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="w-full"
                                                        onClick={() => handleViewSolicitud(solicitud)}
                                                    >
                                                        <EyeIcon className="h-3 w-3 mr-2" />
                                                        Ver más
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <ClipboardListIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No hay solicitudes de material para esta obra</p>
                                </div>
                            )}
                        </div>
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

            {/* Modal de Solicitud */}
            <ViewSolicitudModal
                solicitud={selectedSolicitud}
                isOpen={isSolicitudModalOpen}
                onClose={() => setIsSolicitudModalOpen(false)}
            />
        </>
    );
}
   