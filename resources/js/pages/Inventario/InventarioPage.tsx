import AppLayout from "@/layouts/app-layout"
import { useState } from "react"


import {PageProps} from '@/types/auth'
import {Head, usePage } from '@inertiajs/react'

//Componentes
import SubNavBar from "@/components/Navegacion/SubNavbar"
import CatalogoInventario from "./CatalogoInventario"
import SolicitudesDeMaterial from "./SolicitudesDeMaterial"
import SolicitarMaterial from "./SolicitarMaterial"


// Arreglo de vistas para la SubNavbar
const views = [
  { key: "catalogo", label: "Catálogo" },
  { key: "solicitudes", label: "Solicitudes de Material" },
]


interface InventarioPageProps {
    contador: number;
}

const InventarioPage = ({ contador }: InventarioPageProps) => {

    //Onteniendo rol del usuario
    const page = usePage<PageProps>();
    const userRole = page.props.auth?.role;

    // Estado para saber qué mostrar
    const [view, setView] = useState<"catalogo" | "solicitudes">("catalogo")

    // Nuevo estado para alternar sub-vista de solicitudes cuando es Administrador
    const [adminSolicitudesView, setAdminSolicitudesView] = useState<"lista" | "solicitar">("lista")

    return (
        <AppLayout>
            <Head title="Catálogo" />


            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Header de navegación */}
                <SubNavBar
                    views={views}
                    currentView={view}
                    onChange={(v: string) => setView(v as "catalogo" | "solicitudes")}
                />

                {/* Contenido o Componente a renderizar */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">


                    {view === "catalogo" && <CatalogoInventario/>} 

                    {/* Toggle para Administrador */}
                    {view === "solicitudes" && userRole === 'Administrador' && (
                        <div className="flex flex-col h-full w-full">
                            <div className="flex gap-2 p-3 border-b bg-muted/40">
                                <button
                                    onClick={() => setAdminSolicitudesView("lista")}
                                    className={`px-3 py-1.5 text-sm rounded-md border transition ${
                                        adminSolicitudesView === "lista"
                                            ? "bg-primary text-white border-primary"
                                            : "bg-background hover:bg-accent"
                                    }`}
                                >
                                    Solicitudes
                                </button>
                                <button
                                    onClick={() => setAdminSolicitudesView("solicitar")}
                                    className={`px-3 py-1.5 text-sm rounded-md border transition ${
                                        adminSolicitudesView === "solicitar"
                                            ? "bg-primary text-white border-primary"
                                            : "bg-background hover:bg-accent"
                                    }`}
                                >
                                    Solicitar Material
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                {adminSolicitudesView === "lista" && <SolicitudesDeMaterial />}
                                {adminSolicitudesView === "solicitar" && <SolicitarMaterial />}
                            </div>
                        </div>
                    )}

                    {/* Roles no administradores conservan lógica previa */}
                    {view === "solicitudes" && userRole === 'Bodega' && (
                        <SolicitudesDeMaterial />
                    )}

                    {view === "solicitudes" && userRole === 'Diseño' && (
                        <SolicitarMaterial />
                    )}

                </div>

            </div>

        </AppLayout>
    )
}

export default InventarioPage