import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { AddObraModal } from "@/components/Obras/AddObraModal"
import { ViewObraModal } from "@/components/Obras/ViewObraModal"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { CalendarIcon, EyeIcon } from 'lucide-react'


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

interface ObrasPageProps {
    obras: Obra[];
}

const obrasPage = ({ obras }: ObrasPageProps) => {
    const [success, setSuccess] = useState(false);
    const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleSuccess = () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleViewObra = (obra: Obra) => {
        setSelectedObra(obra);
        setIsViewModalOpen(true);
    };

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

    return (
        <AppLayout>
            <Head title="Obras" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
                    
                    {success && (
                        <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                            <AlertTitle>Éxito</AlertTitle>
                            <AlertDescription>Obra creada correctamente.</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Gestión de Obras</h1>
                        <AddObraModal onSuccess={handleSuccess} />
                    </div>

                    {obras && obras.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {obras.map((obra) => (
                                <Card key={obra.obra_id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg line-clamp-2">
                                                {obra.nombre}
                                            </CardTitle>
                                            <Badge className={getEstadoColor(obra.estado)}>
                                                {getEstadoText(obra.estado)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>
                                                    {new Date(obra.fecha_inicio).toLocaleDateString('es-ES')}
                                                </span>
                                            </div>
                                            
                                            {obra.descripcion && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {obra.descripcion}
                                                </p>
                                            )}
                                            
                                            <div className="pt-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => handleViewObra(obra)}
                                                >
                                                    <EyeIcon className="h-4 w-4 mr-2" />
                                                    Ver más
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No hay obras registradas aún.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ViewObraModal
                obra={selectedObra}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </AppLayout>
    )
}

export default obrasPage