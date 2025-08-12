import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { AddObraModal } from "@/components/Obras/AddObraModal"
import { ViewObraModal } from "@/components/Obras/ViewObraModal"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo, useState } from 'react'
import { CalendarIcon, EyeIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todas' | 'en_progreso' | 'finalizada'>('en_progreso');

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

    const normalize = (text: string) =>
        (text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    const filteredObras = useMemo(() => {
        let list = obras;

        // Estado: en_progreso | finalizada | todas
        if (statusFilter !== 'todas') {
            list = list.filter(o => o.estado === statusFilter);
        }

        // Búsqueda por nombre (insensible a acentos)
        if (searchTerm.trim()) {
            const q = normalize(searchTerm);
            list = list.filter(o => normalize(o.nombre).includes(q));
        }

        return list;
    }, [obras, statusFilter, searchTerm]);

    const emptyMessage = searchTerm.trim()
        ? `No se encontraron obras para "${searchTerm}".`
        : statusFilter === 'en_progreso'
            ? 'No hay obras en progreso para mostrar.'
            : statusFilter === 'finalizada'
                ? 'No hay obras finalizadas para mostrar.'
                : 'No hay obras para mostrar.';

    return (
        <AppLayout>
            <Head title="Obras" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:minh-min p-6">
                    
                    {success && (
                        <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                            <AlertTitle>Éxito</AlertTitle>
                            <AlertDescription>Obra creada correctamente.</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-2xl font-bold">Gestión de Obras</h1>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64"
                            />
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'todas' | 'en_progreso' | 'finalizada')}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en_progreso">En progreso</SelectItem>
                                    <SelectItem value="finalizada">Finalizadas</SelectItem>
                                    <SelectItem value="todas">Ambas</SelectItem>
                                </SelectContent>
                            </Select>
                            <AddObraModal onSuccess={handleSuccess} />
                        </div>
                    </div>

                    {filteredObras.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredObras.map((obra) => (
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
                            <p className="text-muted-foreground">{emptyMessage}</p>
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