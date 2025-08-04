import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, UserIcon, FileTextIcon, DownloadIcon, Loader2 } from "lucide-react"
import { useState } from "react"

interface Solicitud {
    solicitud_id: number;
    fecha_solicitud: string;
    concepto: string;
    reporte_generado_url: string | null;
    created_at: string;
    usuario_name: string;
    usuario_id: number;
}

interface ViewSolicitudModalProps {
    solicitud: Solicitud | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ViewSolicitudModal({ solicitud, isOpen, onClose }: ViewSolicitudModalProps) {
    const [pdfLoading, setPdfLoading] = useState(false);

    if (!solicitud) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadPDF = async (url: string, solicitudId: number) => {
        if (!url) return;
        
        try {
            setPdfLoading(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `solicitud_material_${solicitudId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Solicitud de Material #{solicitud.solicitud_id}</DialogTitle>
                    <DialogDescription>
                        Creada el {formatDateTime(solicitud.created_at)}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Información de la solicitud */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Solicitud</label>
                                <p className="text-sm font-medium">{formatDate(solicitud.fecha_solicitud)}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Solicitado por</label>
                                <p className="text-sm font-medium">{solicitud.usuario_name}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Concepto</label>
                                <p className="text-sm">{solicitud.concepto}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Estado del PDF</label>
                                <Badge variant={solicitud.reporte_generado_url ? "default" : "secondary"}>
                                    {solicitud.reporte_generado_url ? "Disponible" : "No disponible"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* PDF Section */}
                    {solicitud.reporte_generado_url ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Documento PDF</h3>
                                <Button
                                    onClick={() => handleDownloadPDF(solicitud.reporte_generado_url!, solicitud.solicitud_id)}
                                    disabled={pdfLoading}
                                    size="sm"
                                >
                                    {pdfLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                    )}
                                    Descargar PDF
                                </Button>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src={solicitud.reporte_generado_url}
                                    className="w-full h-96"
                                    title="Vista previa del PDF"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay documento PDF disponible para esta solicitud</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
