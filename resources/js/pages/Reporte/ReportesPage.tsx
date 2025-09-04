import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Calendar, Filter, FileText, Wrench, ChevronLeft, ChevronRight } from "lucide-react"

import GestionDetalleModal from "./GestionDetalleModal"
import ReporteDetalleModal from "./ReporteDetalleModal"

import { Gestion } from "@/types/gestion"

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

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

type Props = {
    gestiones: PaginatedData<Gestion>
    reportes: PaginatedData<Reporte>
    fechaSeleccionada: string
    fechasDisponibles: string[]
}

const ReportesPage = ({ gestiones, reportes, fechaSeleccionada, fechasDisponibles = [] }: Props) => {
    const [gestionModalOpen, setGestionModalOpen] = useState(false)
    const [reporteModalOpen, setReporteModalOpen] = useState(false)
    const [selectedGestion, setSelectedGestion] = useState<Gestion | null>(null)
    const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null)

    const openGestionModal = (gestion: Gestion) => {
        setSelectedGestion(gestion)
        setGestionModalOpen(true)
    }

    const closeGestionModal = () => {
        setGestionModalOpen(false)
        setSelectedGestion(null)
    }

    const openReporteModal = (reporte: Reporte) => {
        setSelectedReporte(reporte)
        setReporteModalOpen(true)
    }

    const closeReporteModal = () => {
        setReporteModalOpen(false)
        setSelectedReporte(null)
    }

    const handleDateChange = (fecha: string) => {
        router.get(window.location.pathname, { fecha }, {
            preserveState: false,
            preserveScroll: false
        })
    }

    const handleGestionesPageChange = (page: number) => {
        router.get(window.location.pathname, { 
            fecha: fechaSeleccionada,
            gestiones_page: page,
            reportes_page: reportes.current_page
        }, {
            preserveState: true,
            preserveScroll: true
        })
    }

    const handleReportesPageChange = (page: number) => {
        router.get(window.location.pathname, { 
            fecha: fechaSeleccionada,
            gestiones_page: gestiones.current_page,
            reportes_page: page
        }, {
            preserveState: true,
            preserveScroll: true
        })
    }

    const formatDateForDisplay = (dateString: string) => {
        // Usar la fecha tal como viene del backend sin conversiones de zona horaria
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0-11
        
        const today = new Date()
        const todayString = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0')
        
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.getFullYear() + '-' + 
                             String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(yesterday.getDate()).padStart(2, '0')

        if (dateString === todayString) {
            return 'Hoy'
        } else if (dateString === yesterdayString) {
            return 'Ayer'
        } else {
            return date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }

    const PaginationComponent = ({ 
        currentPage, 
        lastPage, 
        onPageChange, 
        from, 
        to, 
        total 
    }: { 
        currentPage: number
        lastPage: number
        onPageChange: (page: number) => void
        from: number
        to: number
        total: number
    }) => {
        if (lastPage <= 1) return null

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
                <div className="text-xs sm:text-sm text-gray-600">
                    Mostrando {from} a {to} de {total} resultados
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                            let page = i + 1
                            if (lastPage > 5) {
                                if (currentPage > 3) {
                                    page = currentPage - 2 + i
                                }
                                if (currentPage > lastPage - 2) {
                                    page = lastPage - 4 + i
                                }
                            }
                            
                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className="h-8 w-8 p-0 text-xs"
                                >
                                    {page}
                                </Button>
                            )
                        })}
                    </div>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <AppLayout>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-2 sm:gap-4 rounded-xl p-2 sm:p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-3 sm:p-6">
                    
                    {/* Filtro de datos*/}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <span className="font-medium text-sm sm:text-base">Filtrar por fecha:</span>
                        </div>
                        <Select value={fechaSeleccionada} onValueChange={handleDateChange}>
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="Seleccionar fecha" />
                            </SelectTrigger>
                            <SelectContent>
                                {fechasDisponibles.map((fecha) => (
                                    <SelectItem key={fecha} value={fecha}>
                                        {formatDateForDisplay(fecha)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue="gestiones" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-auto">
                            <TabsTrigger value="gestiones" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3">
                                <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm text-center">
                                    <span className="hidden sm:inline">Gestiones de Inventario </span>
                                    <span className="sm:hidden">Gestiones </span>
                                    ({gestiones.total})
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="reportes" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm text-center">
                                    <span className="hidden sm:inline">Reportes de Área </span>
                                    <span className="sm:hidden">Reportes </span>
                                    ({reportes.total})
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="gestiones" className="mt-4 sm:mt-6">
                            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                                {gestiones.total > 0 ? (
                                    <span>Se encontraron {gestiones.total} gestiones para {formatDateForDisplay(fechaSeleccionada)}</span>
                                ) : (
                                    <span>No hay gestiones registradas para {formatDateForDisplay(fechaSeleccionada)}</span>
                                )}
                            </div>

                            {gestiones.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                        {gestiones.data.map((gestion) => (
                                            <div key={gestion.gestion_inv_id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 flex flex-col gap-2">
                                                <div className="font-bold text-sm sm:text-base truncate">{gestion.usuario?.name}</div>
                                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                                    Rol: {gestion.usuario?.roles?.map(r => r.name).join(', ')}
                                                </div>
                                                <div className="text-xs sm:text-sm">
                                                    Tipo: <span className={gestion.tipo_gestion === "Entrada" ? "text-green-600" : "text-red-600"}>{gestion.tipo_gestion}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {formatTime(gestion.created_at)}
                                                </div>
                                                <Button
                                                    className="mt-2 text-xs sm:text-sm py-1 sm:py-2"
                                                    onClick={() => openGestionModal(gestion)}
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    Ver más
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <PaginationComponent
                                        currentPage={gestiones.current_page}
                                        lastPage={gestiones.last_page}
                                        onPageChange={handleGestionesPageChange}
                                        from={gestiones.from}
                                        to={gestiones.to}
                                        total={gestiones.total}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                                    <Filter className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No hay gestiones disponibles
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm">
                                        No se encontraron gestiones para la fecha seleccionada.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reportes" className="mt-4 sm:mt-6">
                            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                                {reportes.total > 0 ? (
                                    <span>Se encontraron {reportes.total} reportes para {formatDateForDisplay(fechaSeleccionada)}</span>
                                ) : (
                                    <span>No hay reportes registrados para {formatDateForDisplay(fechaSeleccionada)}</span>
                                )}
                            </div>

                            {reportes.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                        {reportes.data.map((reporte) => (
                                            <div key={reporte.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 flex flex-col gap-2">
                                                <div className="font-bold text-sm sm:text-base truncate">{reporte.usuario?.name}</div>
                                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                                    Rol: {reporte.usuario?.roles?.map(r => r.name).join(', ')}
                                                </div>
                                                <div className="text-xs sm:text-sm text-blue-600 truncate">
                                                    Obra: {reporte.obra?.nombre}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    Estado: {reporte.obra?.estado}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {formatTime(reporte.created_at)}
                                                </div>
                                                <Button
                                                    className="mt-2 text-xs sm:text-sm py-1 sm:py-2"
                                                    onClick={() => openReporteModal(reporte)}
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    Ver más
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <PaginationComponent
                                        currentPage={reportes.current_page}
                                        lastPage={reportes.last_page}
                                        onPageChange={handleReportesPageChange}
                                        from={reportes.from}
                                        to={reportes.to}
                                        total={reportes.total}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                                    <Filter className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No hay reportes disponibles
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm">
                                        No se encontraron reportes para la fecha seleccionada.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={gestionModalOpen} onOpenChange={open => { if (!open) closeGestionModal() }}>
                <GestionDetalleModal
                    gestion={selectedGestion}
                    onClose={closeGestionModal}
                />
            </Dialog>

            <Dialog open={reporteModalOpen} onOpenChange={open => { if (!open) closeReporteModal() }}>
                <ReporteDetalleModal
                    reporte={selectedReporte}
                    onClose={closeReporteModal}
                />
            </Dialog>
        </AppLayout>
    )
}

export default ReportesPage