import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { AddObraModal } from "@/components/Obras/AddObraModal"
import { ViewObraModal } from "@/components/Obras/ViewObraModal"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { CalendarIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
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

interface PaginatedObras {
    data: Obra[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface ObrasPageProps {
    obras: PaginatedObras;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
}

const obrasPage = ({ obras, filters }: ObrasPageProps) => {
    const [success, setSuccess] = useState(false);
    const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'todas' | 'en_progreso' | 'finalizada'>(filters.status as any || 'en_progreso');

    // Debounce para búsqueda
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            updateFilters({ search: searchTerm, page: 1 });
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    const updateFilters = (newFilters: any) => {
        const currentFilters = {
            search: searchTerm,
            status: statusFilter,
            per_page: filters.per_page,
            page: obras.current_page,
            ...newFilters
        };

        // Limpiar parámetros vacíos
        Object.keys(currentFilters).forEach(key => {
            if (!currentFilters[key] || currentFilters[key] === 'todas') {
                delete currentFilters[key];
            }
        });

        router.get(route('obras'), currentFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus as any);
        updateFilters({ status: newStatus === 'todas' ? null : newStatus, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

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

    const filteredObras = obras.data; // Ya viene filtrado desde el servidor

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
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
                    
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
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
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

                    {/* Información de resultados */}
                    {obras.data.length > 0 && (
                        <div className="mb-4 text-sm text-muted-foreground">
                            Mostrando {obras.from} - {obras.to} de {obras.total} obras
                        </div>
                    )}

                    {obras.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {obras.data.map((obra) => (
                                    <Card key={obra.obra_id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-3">
                                                <CardTitle className="text-lg line-clamp-2 break-words hyphens-auto flex-1 min-w-0">
                                                    {obra.nombre}
                                                </CardTitle>
                                                <Badge className={`${getEstadoColor(obra.estado)} flex-shrink-0 whitespace-nowrap`}>
                                                    {getEstadoText(obra.estado)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">
                                                        {new Date(obra.fecha_inicio).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                                
                                                {obra.descripcion && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">
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
                                                        <EyeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                        <span className="truncate">Ver más</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Paginación */}
                            {obras.last_page > 1 && (
                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Página {obras.current_page} de {obras.last_page}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(obras.current_page - 1)}
                                            disabled={obras.current_page === 1}
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                            Anterior
                                        </Button>

                                        {/* Números de página */}
                                        <div className="flex items-center space-x-1">
                                            {[...Array(Math.min(5, obras.last_page))].map((_, index) => {
                                                let pageNumber;
                                                if (obras.last_page <= 5) {
                                                    pageNumber = index + 1;
                                                } else if (obras.current_page <= 3) {
                                                    pageNumber = index + 1;
                                                } else if (obras.current_page >= obras.last_page - 2) {
                                                    pageNumber = obras.last_page - 4 + index;
                                                } else {
                                                    pageNumber = obras.current_page - 2 + index;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNumber}
                                                        variant={obras.current_page === pageNumber ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNumber}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(obras.current_page + 1)}
                                            disabled={obras.current_page === obras.last_page}
                                        >
                                            Siguiente
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
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