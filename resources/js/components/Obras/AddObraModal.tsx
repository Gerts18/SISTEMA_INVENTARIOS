import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription } from '@radix-ui/react-dialog';
import { CirclePlus } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import MultiFileUpload from '@/components/Files/MultiFileUpload';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface AddObraModalProps {
    onSuccess: () => void;
}

interface ObraFormData {
    nombre: string;
    descripcion: string;
    fecha_final: string;
}

export const AddObraModal: React.FC<AddObraModalProps> = ({ onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ObraFormData>({
        nombre: '',
        descripcion: '',
        fecha_final: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null]);

    // Calculate if form is valid
    const isFormValid = useMemo(() => {
        const hasFiles = selectedFiles.some(file => file !== null);
        const hasName = formData.nombre.trim().length > 0;
        const hasFechaFinal = formData.fecha_final.trim().length > 0;
        return hasFiles && hasName && hasFechaFinal && !isSubmitting;
    }, [selectedFiles, formData.nombre, formData.fecha_final, isSubmitting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that at least one file is selected
        const validFiles = selectedFiles.filter(file => file !== null);
        if (validFiles.length === 0) {
            setFormError('Debe subir al menos un archivo para crear la obra.');
            return;
        }

        if (!formData.nombre.trim()) {
            setFormError('El nombre de la obra es obligatorio.');
            return;
        }

        if (!formData.fecha_final.trim()) {
            setFormError('La fecha estimada de finalización es obligatoria.');
            return;
        }

        // Validate fecha_final is not in the past
        const today = new Date();
        const selectedDate = new Date(formData.fecha_final);
        if (selectedDate < today) {
            setFormError('La fecha estimada de finalización no puede ser anterior a hoy.');
            return;
        }

        setFormError(null);
        setIsSubmitting(true);

        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre);
        formDataToSend.append('descripcion', formData.descripcion);
        formDataToSend.append('fecha_final', formData.fecha_final);
        
        // Add files
        validFiles.forEach((file, index) => {
            if (file) {
                formDataToSend.append(`archivo_${index}`, file);
            }
        });

        try {
            const response = await axios.post(route('obras.store'), formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            if (response.data.success) {
                console.log('Obra creada exitosamente');
                setOpen(false);
                onSuccess();

                // Reset form
                setFormData({
                    nombre: '',
                    descripcion: '',
                    fecha_final: '',
                });
                setSelectedFiles([null, null, null]);
                setFormError(null);

                // Refresh the page to show the new obra
                router.reload({ only: ['obras'] });
            } else {
                setFormError(response.data.message || 'Error al crear la obra');
            }
        } catch (error: any) {
            console.error('Error al crear obra:', error);
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessage = Object.values(errors).flat().join(', ');
                setFormError(errorMessage);
            } else if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError('Error al crear la obra. Intente nuevamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilesChange = (files: (File | null)[]) => {
        setSelectedFiles(files);
        // Clear form error when files are added
        if (files.some(file => file !== null) && formError) {
            setFormError(null);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData({ ...formData, nombre: newName });
        // Clear form error when name is added
        if (newName.trim() && formError) {
            setFormError(null);
        }
    };

    const handleDescripcionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDescripcion = e.target.value;
        if (newDescripcion.length <= 500) {
            setFormData({ ...formData, descripcion: newDescripcion });
        }
    };

    const handleFechaFinalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFecha = e.target.value;
        setFormData({ ...formData, fecha_final: newFecha });
        // Clear form error when date is added
        if (newFecha.trim() && formError) {
            setFormError(null);
        }
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <CirclePlus className="h-4 w-4" />
                    Nueva Obra
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear nueva obra</DialogTitle>
                    <DialogDescription>Complete los campos del formulario para registrar una nueva obra.</DialogDescription>
                </DialogHeader>

                {formError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="nombre">Nombre de la obra <span className="text-red-500">*</span></Label>
                        <Input 
                            id="nombre" 
                            value={formData.nombre} 
                            onChange={handleNameChange}
                            placeholder="Ingrese el nombre de la obra"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="descripcion">
                            Descripción 
                            <span className="text-sm text-gray-500 ml-2">
                                ({formData.descripcion.length}/500 caracteres)
                            </span>
                        </Label>
                        <Textarea 
                            id="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleDescripcionChange}
                            placeholder="Descripción detallada de la obra (opcional)"
                            rows={3}
                            className={formData.descripcion.length >= 450 ? 'border-orange-300' : ''}
                        />
                    </div>

                    <div>
                        <Label htmlFor="fecha_final">Fecha estimada de finalización <span className="text-red-500">*</span></Label>
                        <Input 
                            id="fecha_final" 
                            type="date"
                            value={formData.fecha_final} 
                            onChange={handleFechaFinalChange}
                            min={today}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <MultiFileUpload 
                            onFilesChange={handleFilesChange}
                            maxFiles={3}
                            required={true}
                            title="Archivos de la obra"
                            description="Suba los documentos, planos o imágenes relacionados con la obra"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!isFormValid}
                            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {isSubmitting ? 'Creando...' : 'Crear Obra'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
