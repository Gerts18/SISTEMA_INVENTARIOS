import AppLayout from "@/layouts/app-layout"
import { useState } from "react"


//Componentes
import CatalogoInventarios from "./catalogo"
import SolicitudMateriales from "./solicitudMaterial"

import SubNavBar from "@/components/Navegacion/subNav"

const views = [
  { key: "catalogo", label: "Catálogo" },
  { key: "solicitudes", label: "Solicitudes de Material" },
]


const InventariosMain = () => {

    // Estado para saber qué mostrar
    const [view, setView] = useState<"catalogo" | "solicitudes">("catalogo")

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

                    {view === "catalogo" && <CatalogoInventarios />}
                    {view === "solicitudes" && <SolicitudMateriales />}

                </div>

            </div>

        </AppLayout>
    )
}

export default InventariosMain