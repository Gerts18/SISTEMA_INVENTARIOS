import AppLayout from "@/layouts/app-layout"
import { useState } from "react"


import {PageProps} from '@/types/auth'
import {usePage } from '@inertiajs/react'

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

    const [num, setNum] = useState(contador)

    return (
        <AppLayout>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Header de navegación */}
                <SubNavBar
                    views={views}
                    currentView={view}
                    onChange={(v: string) => setView(v as "catalogo" | "solicitudes")}
                />

                {/* Contenido o Componente a renderizar */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">

                    <p>Contador  {num} </p>

                    <button onClick={() => setNum(num + 1)} >
                        aumentar
                    </button>

                    {view === "catalogo" && <CatalogoInventario/>}

                    {view === "solicitudes" && (userRole === 'Bodega' || userRole === 'Administrador') && (
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