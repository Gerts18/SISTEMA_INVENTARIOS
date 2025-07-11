import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { AddObraModal } from "@/components/Obras/AddObraModal"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useState } from 'react'


const obrasPage = () => {
    const [success, setSuccess] = useState(false);

    const handleSuccess = () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

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

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Gestión de Obras</h1>
                        <AddObraModal onSuccess={handleSuccess} />
                    </div>

                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Aquí podrá gestionar todas las obras del proyecto.
                        </p>
                        {/* TODO: Add obras list/table here */}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default obrasPage