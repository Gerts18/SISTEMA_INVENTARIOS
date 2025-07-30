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

interface AddObraModalProps {
    onSuccess: () => void;
}

interface ObraFormData {
    nombre: string;
    descripcion: string;
}

export const AddObraModal: React.FC<AddObraModalProps> = ({ onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ObraFormData>({
        nombre: '',
        descripcion: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null]);

    // Calculate if form is valid
    const isFormValid = useMemo(() => {
        const hasFiles = selectedFiles.some(file => file !== null);
        const hasName = formData.nombre.trim().length > 0;
        return hasFiles && hasName && !isSubmitting;
    }, [selectedFiles, formData.nombre, isSubmitting]);

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

        setFormError(null);
        setIsSubmitting(true);

        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre);
        formDataToSend.append('descripcion', formData.descripcion);
        
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
                });
                setSelectedFiles([null, null, null]);
                setFormError(null);
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
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea 
                            id="descripcion" 
                            value={formData.descripcion} 
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Descripción detallada de la obra (opcional)"
                            rows={3}
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
