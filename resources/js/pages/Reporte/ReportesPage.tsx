import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Calendar, Filter } from "lucide-react"

import GestionDetalleModal from "./GestionDetalleModal"

import { Gestion } from "@/types/gestion"


type Props = {
    gestiones: Gestion[]
    fechaSeleccionada: string
    fechasDisponibles: string[]
}

const ReportesPage = ({ gestiones = [], fechaSeleccionada, fechasDisponibles = [] }: Props) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedGestion, setSelectedGestion] = useState<Gestion | null>(null)

    const openModal = (gestion: Gestion) => {
        setSelectedGestion(gestion)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedGestion(null)
    }

    const handleDateChange = (fecha: string) => {
        router.get(window.location.pathname, { fecha }, {
            preserveState: true,
            preserveScroll: true
        })
    }

    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Hoy'
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
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

    return (
        <AppLayout>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
                    
                    {/* Date Filter */}
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Filtrar por fecha:</span>
                        </div>
                        <Select value={fechaSeleccionada} onValueChange={handleDateChange}>
                            <SelectTrigger className="w-64">
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

                    {/* Results Info */}
                    <div className="mb-4 text-sm text-gray-600">
                        {gestiones.length > 0 ? (
                            <span>Se encontraron {gestiones.length} gestiones para {formatDateForDisplay(fechaSeleccionada)}</span>
                        ) : (
                            <span>No hay gestiones registradas para {formatDateForDisplay(fechaSeleccionada)}</span>
                        )}
                    </div>

                    {/* Gestiones Grid */}
                    {gestiones.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gestiones.map((gestion) => (
                                <div key={gestion.gestion_inv_id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2">
                                    <div className="font-bold">{gestion.usuario?.name}</div>
                                    <div className="text-sm text-gray-500">
                                        Rol: {gestion.usuario?.roles?.map(r => r.name).join(', ')}
                                    </div>
                                    <div className="text-sm">
                                        Tipo: <span className={gestion.tipo_gestion === "Entrada" ? "text-green-600" : "text-red-600"}>{gestion.tipo_gestion}</span>
                                    </div>
                                    <Button
                                        className="mt-2"
                                        onClick={() => openModal(gestion)}
                                        variant="default"
                                    >
                                        Ver más
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Filter className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No hay reportes disponibles
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No se encontraron gestiones para la fecha seleccionada.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={open => { if (!open) closeModal() }}>
                <GestionDetalleModal
                    gestion={selectedGestion}
                    onClose={closeModal}
                />
            </Dialog>
        </AppLayout>
    )
}

export default ReportesPage