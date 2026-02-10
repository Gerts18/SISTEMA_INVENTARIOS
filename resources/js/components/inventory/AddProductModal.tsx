import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogDescription } from '@radix-ui/react-dialog';
import { CirclePlus } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

interface AddProductModalProps {
    onSuccess: () => void;
    onProductCreated: () => void;
}

interface ProductFormData {
    nombre: string;
    precio_lista: string;
    precio_publico: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onSuccess, onProductCreated }) => {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        nombre: '',
        precio_lista: '',
        precio_publico: '',
    });

    // Validar que el precio no exceda el límite de la base de datos (DECIMAL 10,2)
    const MAX_PRICE = 99999999.99;

    const validatePrice = (price: string, fieldName: string): string | null => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) {
            return `${fieldName} debe ser un número válido.`;
        }
        if (numPrice < 0) {
            return `${fieldName} no puede ser negativo.`;
        }
        if (numPrice > MAX_PRICE) {
            return `${fieldName} no puede exceder $${MAX_PRICE.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (!formData.nombre || !formData.precio_lista || !formData.precio_publico) {
                setFormError('El nombre y los precios son obligatorios.');
                setIsSubmitting(false);
                return;
            }

            // Validar precios
            const errorPrecioLista = validatePrice(formData.precio_lista, 'Precio de Lista');
            if (errorPrecioLista) {
                setFormError(errorPrecioLista);
                setIsSubmitting(false);
                return;
            }

            const errorPrecioPublico = validatePrice(formData.precio_publico, 'Precio Público');
            if (errorPrecioPublico) {
                setFormError(errorPrecioPublico);
                setIsSubmitting(false);
                return;
            }

            const payload = {
                nombre: formData.nombre,
                stock: 0,
                precio_lista: parseFloat(formData.precio_lista),
                precio_publico: parseFloat(formData.precio_publico),
            };

            const response = await axios.post('/inventario/create', payload);

            if (response.data.success) {
                setOpen(false);
                onSuccess();
                onProductCreated();

                // Resetear formulario
                setFormData({
                    nombre: '',
                    precio_lista: '',
                    precio_publico: '',
                });
                setFormError(null);
            }
        } catch (error: any) {
            console.error('Error al crear producto:', error);
            const errorMessage = error.response?.data?.message ||
                Object.values(error.response?.data?.errors || {}).join(', ') ||
                'Error al crear el producto.';
            setFormError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Agregar producto
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar nuevo producto</DialogTitle>
                    <DialogDescription>
                        Complete los campos del formulario. El código se generará automáticamente.
                    </DialogDescription>
                </DialogHeader>

                {formError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                    <div>
                        <Label htmlFor="nombre">Nombre del Producto *</Label>
                        <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Cemento gris 50kg"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="precio_lista">Precio de Lista *</Label>
                            <Input
                                id="precio_lista"
                                type="number"
                                step="0.01"
                                min="0"
                                max="99999999.99"
                                value={formData.precio_lista}
                                onChange={(e) => setFormData({ ...formData, precio_lista: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                            <span className="text-xs text-muted-foreground">
                                Máximo: $99,999,999.99
                            </span>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="precio_publico">Precio Público *</Label>
                            <Input
                                id="precio_publico"
                                type="number"
                                step="0.01"
                                min="0"
                                max="99999999.99"
                                value={formData.precio_publico}
                                onChange={(e) => setFormData({ ...formData, precio_publico: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                            <span className="text-xs text-muted-foreground">
                                Máximo: $99,999,999.99
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
