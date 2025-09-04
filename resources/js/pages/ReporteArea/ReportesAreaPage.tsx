import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Obra {
    obra_id: number;
    nombre: string;
    estado: string;
}

const ReportesAreaPage = () => {
    const [obras, setObras] = useState<Obra[]>([]);
    const [selectedObra, setSelectedObra] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{obra?: string, descripcion?: string}>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchObras();
    }, []);

    const fetchObras = async () => {
        try {
            const response = await axios.get('/reportesArea/obras');
            setObras(response.data);
        } catch (error) {
            console.error('Error fetching obras:', error);
            setErrorMessage('Error al cargar las obras. Por favor, recargue la página.');
        }
    };

    const clearMessages = () => {
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    const validateForm = () => {
        const newErrors: {obra?: string, descripcion?: string} = {};

        if (!selectedObra) {
            newErrors.obra = 'Debe seleccionar una obra';
        }

        if (!descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        } else if (descripcion.trim().length > 500) {
            newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post('/reportesArea/create', {
                obra_id: selectedObra,
                descripcion: descripcion.trim(),
                fecha: new Date().toISOString().split('T')[0]
            });
            
            // Reset form
            setSelectedObra('');
            setDescripcion('');
            setErrors({});
            setSuccessMessage('Reporte creado exitosamente. La información ha sido guardada correctamente.');
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (error: any) {
            console.error('Error creating report:', error);
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessage = Object.values(errors).flat().join(', ');
                setErrorMessage(`Error de validación: ${errorMessage}`);
            } else if (error.response?.data?.message) {
                setErrorMessage(`Error al crear el reporte: ${error.response.data.message}`);
            } else if (error.response?.status === 422) {
                setErrorMessage('Error de validación. Por favor, verifique los datos ingresados.');
            } else if (error.response?.status === 500) {
                setErrorMessage('Error interno del servidor. Por favor, intente nuevamente.');
            } else {
                setErrorMessage('Error al crear el reporte. Por favor, verifique su conexión e intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleObraChange = (value: string) => {
        setSelectedObra(value);
        if (errors.obra) {
            setErrors(prev => ({...prev, obra: undefined}));
        }
        clearMessages();
    };

    const handleDescripcionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setDescripcion(value);
        
        if (errors.descripcion) {
            setErrors(prev => ({...prev, descripcion: undefined}));
        }
        clearMessages();
    };

    return (
        <AppLayout>
            <Head title="Reportes de Area" />
            
            <div className="flex h-full flex-1 flex-col gap-2 sm:gap-4 rounded-xl p-2 sm:p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-3 sm:p-6">
                    <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
                        <Card className="w-full">
                            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-center sm:text-left">
                                    Crear Reporte de Área
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base text-center sm:text-left">
                                    Seleccione una obra y describa el reporte que desea generar
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                {successMessage && (
                                    <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            {successMessage}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {errorMessage && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="obra" className="text-sm sm:text-base">
                                            Seleccionar Obra *
                                        </Label>
                                        <Select value={selectedObra} onValueChange={handleObraChange} required>
                                            <SelectTrigger className={`w-full h-10 sm:h-11 ${errors.obra ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Seleccione una obra..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {obras.map((obra) => (
                                                    <SelectItem key={obra.obra_id} value={obra.obra_id.toString()}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                            <span className="font-medium">{obra.nombre}</span>
                                                            <span className="text-xs sm:text-sm text-muted-foreground">
                                                                ({obra.estado})
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.obra && (
                                            <Alert variant="destructive" className="py-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm">
                                                    {errors.obra}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="descripcion" className="text-sm sm:text-base">
                                                Descripción del Reporte *
                                            </Label>
                                            <span className={`text-xs sm:text-sm ${
                                                descripcion.length > 500 ? 'text-red-500' : 
                                                descripcion.length > 450 ? 'text-yellow-500' : 
                                                'text-muted-foreground'
                                            }`}>
                                                {descripcion.length}/500
                                            </span>
                                        </div>
                                        <Textarea
                                            id="descripcion"
                                            value={descripcion}
                                            onChange={handleDescripcionChange}
                                            rows={4}
                                            placeholder="Ingrese la descripción del reporte..."
                                            className={`resize-none min-h-[100px] sm:min-h-[120px] text-sm sm:text-base ${
                                                errors.descripcion ? 'border-red-500' : ''
                                            }`}
                                            maxLength={500}
                                            required
                                        />
                                        {errors.descripcion && (
                                            <Alert variant="destructive" className="py-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm">
                                                    {errors.descripcion}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || !selectedObra || !descripcion.trim() || descripcion.length > 500}
                                        className="w-full bg-black hover:bg-gray-800 text-white h-10 sm:h-12 text-sm sm:text-base disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            'Crear Reporte'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default ReportesAreaPage