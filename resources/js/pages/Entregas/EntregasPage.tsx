import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { AddEntregaModal } from '@/components/Entregas/AddEntregaModal';
import { ViewEntregaModal } from '@/components/Entregas/ViewEntregaModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { CalendarIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { Entrega, EntregasPageProps } from '@/types/entregas';
import type { PageProps } from '@/types/auth';

const EntregasPage = ({ entregas, filters, userRole }: EntregasPageProps) => {
    const page = usePage<PageProps>();
    const currentUserId = (page.props.auth as any)?.user?.id;

    const [success, setSuccess] = useState(false);
    const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'todas');

    const canCreate = userRole === 'Produccion' || userRole === 'Administrador';

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
            page: entregas.current_page,
            ...newFilters,
        };

        // Limpiar parámetros vacíos
        Object.keys(currentFilters).forEach((key) => {
            if (!currentFilters[key] || currentFilters[key] === 'todas') {
                delete currentFilters[key];
            }
        });

        router.get(route('entregas'), currentFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        updateFilters({ status: newStatus === 'todas' ? null : newStatus, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

    const handleSuccess = () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleViewEntrega = (entrega: Entrega) => {
        setSelectedEntrega(entrega);
        setIsViewModalOpen(true);
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'recibido':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'faltante':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'no_recibido':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoText = (estado: string) => {
        switch (estado) {
            case 'recibido':
                return 'Recibido';
            case 'faltante':
                return 'Faltante';
            case 'no_recibido':
                return 'No recibido';
            default:
                return estado;
        }
    };

    const getEstadoGeneralBadge = (estado: string) => {
        switch (estado) {
            case 'en_curso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completado':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const emptyMessage = searchTerm.trim()
        ? `No se encontraron entregas para "${searchTerm}".`
        : statusFilter === 'en_curso'
            ? 'No hay entregas en curso.'
            : statusFilter === 'completado'
                ? 'No hay entregas completadas.'
                : 'No hay entregas para mostrar.';

    return (
        <AppLayout>
            <Head title="Entregas" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
                    {success && (
                        <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                            <AlertTitle>Éxito</AlertTitle>
                            <AlertDescription>Entrega creada correctamente.</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-2xl font-bold">Entregas</h1>
                        <div className="flex flex-col gap-2 w-full md:flex-row md:w-auto">
                            <Input
                                placeholder="Buscar por título u obra..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64"
                            />
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en_curso">En curso</SelectItem>
                                    <SelectItem value="completado">Completadas</SelectItem>
                                    <SelectItem value="todas">Todas</SelectItem>
                                </SelectContent>
                            </Select>
                            {canCreate && (
                                <div className="w-full md:w-auto">
                                    <AddEntregaModal onSuccess={handleSuccess} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información de resultados */}
                    {entregas.data.length > 0 && (
                        <div className="mb-4 text-sm text-muted-foreground">
                            Mostrando {entregas.from} - {entregas.to} de {entregas.total} entregas
                        </div>
                    )}

                    {entregas.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {entregas.data.map((entrega) => (
                                    <Card key={entrega.entrega_id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-3">
                                                <CardTitle className="text-lg line-clamp-2 break-words hyphens-auto flex-1 min-w-0">
                                                    {entrega.titulo}
                                                </CardTitle>
                                                <Badge className={`${getEstadoGeneralBadge(entrega.estado_general)} flex-shrink-0 whitespace-nowrap`}>
                                                    {entrega.estado_general === 'en_curso' ? 'En Curso' : 'Completado'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    {entrega.obra.nombre}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">
                                                        {entrega.transicion_actual
                                                            ? new Date(entrega.transicion_actual.fecha).toLocaleDateString('es-ES')
                                                            : new Date(entrega.created_at).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>

                                                {entrega.transicion_actual && (
                                                    <Badge className={`${getEstadoBadge(entrega.transicion_actual.estado)}`}>
                                                        {getEstadoText(entrega.transicion_actual.estado)}
                                                    </Badge>
                                                )}

                                                {entrega.transicion_actual?.es_devolucion && (
                                                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                                                        Devolución
                                                    </Badge>
                                                )}

                                                <div className="pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleViewEntrega(entrega)}
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                        <span className="truncate">Más información</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Paginación */}
                            {entregas.last_page > 1 && (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
                                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                                        Página {entregas.current_page} de {entregas.last_page}
                                    </div>

                                    <div className="flex items-center justify-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(entregas.current_page - 1)}
                                            disabled={entregas.current_page === 1}
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                            <span className="hidden sm:inline">Anterior</span>
                                        </Button>

                                        {/* Números de página */}
                                        <div className="flex items-center space-x-1">
                                            {[...Array(Math.min(5, entregas.last_page))].map((_, index) => {
                                                let pageNumber;
                                                if (entregas.last_page <= 5) {
                                                    pageNumber = index + 1;
                                                } else if (entregas.current_page <= 3) {
                                                    pageNumber = index + 1;
                                                } else if (entregas.current_page >= entregas.last_page - 2) {
                                                    pageNumber = entregas.last_page - 4 + index;
                                                } else {
                                                    pageNumber = entregas.current_page - 2 + index;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNumber}
                                                        variant={entregas.current_page === pageNumber ? 'default' : 'outline'}
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
                                            onClick={() => handlePageChange(entregas.current_page + 1)}
                                            disabled={entregas.current_page === entregas.last_page}
                                        >
                                            <span className="hidden sm:inline">Siguiente</span>
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

            <ViewEntregaModal
                entrega={selectedEntrega}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                userRole={userRole}
                currentUserId={currentUserId}
            />
        </AppLayout>
    );
};

export default EntregasPage;
