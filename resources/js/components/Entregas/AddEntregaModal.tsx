import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DialogDescription } from '@radix-ui/react-dialog';
import { CirclePlus } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface AddEntregaModalProps {
    onSuccess: () => void;
}

interface ObraOption {
    obra_id: number;
    nombre: string;
}

interface UsuarioOption {
    id: number;
    name: string;
    role: string;
}

interface EntregaFormData {
    obra_id: string;
    destinatario_id: string;
    titulo: string;
    descripcion: string;
    fecha: string;
}

export const AddEntregaModal: React.FC<AddEntregaModalProps> = ({ onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [obras, setObras] = useState<ObraOption[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
    const [formData, setFormData] = useState<EntregaFormData>({
        obra_id: '',
        destinatario_id: '',
        titulo: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (open) {
            loadObras();
            loadUsuarios();
        }
    }, [open]);

    const loadObras = async () => {
        try {
            const response = await axios.get(route('entregas.obras'));
            setObras(response.data);
        } catch (error) {
            console.error('Error loading obras:', error);
        }
    };

    const loadUsuarios = async () => {
        try {
            const response = await axios.get(route('entregas.usuarios'));
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error loading usuarios:', error);
        }
    };

    const obrasOptions = useMemo(() => {
        return obras.map(obra => ({
            value: String(obra.obra_id),
            label: obra.nombre,
        }));
    }, [obras]);

    const usuariosOptions = useMemo(() => {
        return usuarios.map(user => ({
            value: String(user.id),
            label: `${user.name} (${user.role})`,
        }));
    }, [usuarios]);

    const isFormValid = useMemo(() => {
        return (
            formData.obra_id !== '' &&
            formData.destinatario_id !== '' &&
            formData.titulo.trim().length > 0 &&
            formData.fecha.trim().length > 0 &&
            !isSubmitting
        );
    }, [formData, isSubmitting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.obra_id) {
            setFormError('Debe seleccionar una obra.');
            return;
        }
        if (!formData.destinatario_id) {
            setFormError('Debe seleccionar un destinatario.');
            return;
        }
        if (!formData.titulo.trim()) {
            setFormError('El título es obligatorio.');
            return;
        }
        if (!formData.fecha.trim()) {
            setFormError('La fecha es obligatoria.');
            return;
        }

        setFormError(null);
        setIsSubmitting(true);

        try {
            const response = await axios.post(route('entregas.store'), {
                obra_id: Number(formData.obra_id),
                destinatario_id: Number(formData.destinatario_id),
                titulo: formData.titulo,
                descripcion: formData.descripcion || null,
                fecha: formData.fecha,
            });

            if (response.data.success) {
                setOpen(false);
                onSuccess();

                setFormData({
                    obra_id: '',
                    destinatario_id: '',
                    titulo: '',
                    descripcion: '',
                    fecha: new Date().toISOString().split('T')[0],
                });
                setFormError(null);

                router.reload({ only: ['entregas'] });
            } else {
                setFormError(response.data.message || 'Error al crear la entrega.');
            }
        } catch (error: any) {
            console.error('Error al crear entrega:', error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessage = Object.values(errors).flat().join(', ');
                setFormError(errorMessage);
            } else if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError('Error al crear la entrega. Intente nuevamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitulo = e.target.value;
        if (newTitulo.length <= 255) {
            setFormData({ ...formData, titulo: newTitulo });
            if (newTitulo.trim() && formError) {
                setFormError(null);
            }
        }
    };

    const handleDescripcionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDescripcion = e.target.value;
        if (newDescripcion.length <= 500) {
            setFormData({ ...formData, descripcion: newDescripcion });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2">
                    <CirclePlus className="h-4 w-4" />
                    Nuevo Envío
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear nuevo envío de material</DialogTitle>
                    <DialogDescription>Complete los campos para registrar una nueva entrega de material.</DialogDescription>
                </DialogHeader>

                {formError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="obra_id">
                            Obra <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={obrasOptions}
                            value={formData.obra_id}
                            onChange={(value) => {
                                setFormData({ ...formData, obra_id: value });
                                if (formError) setFormError(null);
                            }}
                            placeholder="Seleccione una obra"
                        />
                    </div>

                    <div>
                        <Label htmlFor="destinatario_id">
                            Enviar a Usuario <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={usuariosOptions}
                            value={formData.destinatario_id}
                            onChange={(value) => {
                                setFormData({ ...formData, destinatario_id: value });
                                if (formError) setFormError(null);
                            }}
                            placeholder="Seleccione un usuario"
                        />
                    </div>

                    <div>
                        <Label htmlFor="titulo">
                            Título <span className="text-red-500">*</span>
                            <span className="text-sm text-gray-500 ml-2">
                                ({formData.titulo.length}/255 caracteres)
                            </span>
                        </Label>
                        <Input
                            id="titulo"
                            value={formData.titulo}
                            onChange={handleTituloChange}
                            placeholder="Ej: Closet, Mueble de cocina..."
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
                            placeholder="Descripción del material a enviar (opcional)"
                            rows={3}
                            className={formData.descripcion.length >= 450 ? 'border-orange-300' : ''}
                        />
                    </div>

                    <div>
                        <Label htmlFor="fecha">Fecha <span className="text-red-500">*</span></Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full sm:w-auto${!isFormValid ? ' opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Creando...' : 'Enviar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
