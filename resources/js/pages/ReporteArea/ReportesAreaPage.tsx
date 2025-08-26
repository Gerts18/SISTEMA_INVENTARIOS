import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

const ReportesAreaPage = () => {


    return (
        <AppLayout>
            <Head title="Reportes de Area" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
                    Hola
                </div>

            </div>

        </AppLayout>
    )
}

export default ReportesAreaPage