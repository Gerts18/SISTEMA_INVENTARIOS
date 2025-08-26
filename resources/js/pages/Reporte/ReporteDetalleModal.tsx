import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Building, FileText } from "lucide-react"

interface Reporte {
    id: number;
    fecha: string;
    descripcion: string;
    obra_id: number;
    usuario_id: number;
    created_at: string;
    updated_at: string;
    usuario: {
        id: number;
        name: string;
        roles: Array<{
            id: number;
            name: string;
        }>;
    };
    obra: {
        obra_id: number;
        nombre: string;
        estado: string;
    };
}

type Props = {
    reporte: Reporte | null
    onClose: () => void
}

const ReporteDetalleModal = ({ reporte, onClose }: Props) => {
    if (!reporte) return null

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getEstadoBadgeVariant = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'en_progreso':
                return 'default'
            case 'finalizada':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const getEstadoText = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'en_progreso':
                return 'En Progreso'
            case 'finalizada':
                return 'Finalizada'
            default:
                return estado
        }
    }

    return (
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reporte #{reporte.id}
                </DialogTitle>
                <DialogDescription>
                    Información detallada del reporte de área.
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 min-w-0">
                {/* Información básica */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Información General
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Usuario</label>
                                <p className="font-semibold">{reporte.usuario?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Rol</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {reporte.usuario?.roles?.map((role) => (
                                        <Badge key={role.id} variant="outline" className="text-xs">
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha del Reporte</label>
                                <p className="font-medium">{formatDate(reporte.fecha)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Creado</label>
                                <p className="text-sm text-gray-600">{formatDateTime(reporte.created_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de la obra */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building className="h-5 w-5" />
                            Obra Asociada
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombre de la Obra</label>
                                <p className="font-semibold text-blue-600">{reporte.obra?.nombre}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Estado</label>
                                <div className="mt-1">
                                    <Badge variant={getEstadoBadgeVariant(reporte.obra?.estado)}>
                                        {getEstadoText(reporte.obra?.estado)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Descripción del reporte */}
                <Card className="w-full min-w-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Descripción del Reporte
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full min-w-0 overflow-hidden">
                            <p className="text-sm leading-relaxed break-words hyphens-auto min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                                {reporte.descripcion}
                            </p>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {reporte.descripcion.length} caracteres
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogClose>
        </DialogContent>
    )
}

export default ReporteDetalleModal
