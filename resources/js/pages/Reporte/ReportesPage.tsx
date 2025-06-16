import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import GestionDetalleModal from "./GestionDetalleModal"

import { Producto } from "@/types/inventarios"

import { CambioProducto, Usuario, Gestion } from "@/types/gestion"


type Props = {
    gestiones: Gestion[]
}

const ReportesPage = ({ gestiones = [] }: Props) => {
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

    return (
        <AppLayout>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
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