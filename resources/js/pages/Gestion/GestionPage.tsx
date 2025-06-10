import { Combobox } from "@/components/combobox"
import AppLayout from "@/layouts/app-layout"
import { Head, usePage } from "@inertiajs/react"
import * as React from "react"
import GestionComponent from "./GestionProductoComponent"


const GestionPage = () => {
    const [tipo, setTipo] = React.useState("")
    const { producto, flash } = usePage().props as any

    return (
        <AppLayout>
            <Head title="Entradas/Salidas" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">

                    <Combobox
                        value={tipo}
                        onChange={setTipo}

                    />

                    {tipo === "entrada" && (
                        <GestionComponent producto={producto} flash={flash} />
                    )}
                    {tipo === "salida" && (
                        <div>
                            Salida
                        </div>
                    )}
                    
                </div>
                
            </div>

        </AppLayout>
    )
}

export default GestionPage