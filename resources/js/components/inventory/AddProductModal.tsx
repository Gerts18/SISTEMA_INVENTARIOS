import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { router } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { CirclePlus } from 'lucide-react';
import React, { useState } from 'react';

interface Proveedor {
    proveedor_id: string;
    nombre: string;
}

interface AddProductModalProps {
    proveedores: Proveedor[];
    selectedCategoryId: string;
    onSuccess: () => void;
    onProductCreated: () => void;
}

interface ProductFormData {
    proveedor_id: string;
    nombre: string;
    codigo: string;
    stock: number;
    precio_lista: string;
    precio_publico: string;
    categoria_id: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ proveedores, selectedCategoryId, onSuccess, onProductCreated }) => {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
        proveedor_id: '',
        nombre: '',
        codigo: '',
        stock: 0,
        precio_lista: '',
        precio_publico: '',
        categoria_id: selectedCategoryId,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            categoria_id: parseInt(formData.categoria_id),
            stock: Number(formData.stock),
            precio_lista: parseFloat(formData.precio_lista),
            precio_publico: parseFloat(formData.precio_publico),
        };

        try {
            if (!payload.nombre || !payload.codigo || !payload.proveedor_id || !payload.precio_lista || !payload.precio_publico) {
                setFormError('Todos los campos son obligatorios.');
                return;
            }
        } catch (error) {
            setFormError('Error de validación. Por favor, revisa los datos ingresados.');
            return;
        }

        setFormError(null);

        router.post(route('inventario.store'), payload, {
            onError: (errors) => {
                console.error('Errores de validación:', errors);
                let errorMessage = '';
                if (typeof errors === 'object' && !Array.isArray(errors)) {
                    errorMessage = Object.values(errors).join(', ');
                } else {
                    errorMessage = String(errors);
                }
                setFormError(` ${errorMessage}`);
            },
            onSuccess: () => {
                console.log('Producto creado exitosamente');
                setOpen(false);
                onSuccess();
                onProductCreated();


                setFormData({
                    proveedor_id: '',
                    nombre: '',
                    codigo: '',
                    stock: 0,
                    precio_lista: '',
                    precio_publico: '',
                    categoria_id: selectedCategoryId,
                });
                setFormError(null);
            },
        });
    };

    // Actualizar categoria_id cuando selectedCategoryId cambie
    React.useEffect(() => {
        setFormData((prev) => ({ ...prev, categoria_id: selectedCategoryId }));
    }, [selectedCategoryId]);

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
                    <DialogDescription>Complete los campos del formulario para registrar un nuevo producto.</DialogDescription>
                </DialogHeader>

                {formError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                    <div>
                        <Label htmlFor="proveedor_id">Proveedor</Label>
                        <SearchableSelect
                            options={proveedores.map((prov) => ({
                                value: prov.proveedor_id,
                                label: prov.nombre,
                            }))}
                            value={formData.proveedor_id}
                            onChange={(value) => setFormData({ ...formData, proveedor_id: value })}
                            placeholder="Seleccione un proveedor"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="codigo">Código</Label>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                maxLength={6}
                                inputMode="numeric"
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData({ ...formData, codigo: value });
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="precio_lista">Precio de Lista</Label>
                            <Input
                                id="precio_lista"
                                type="number"
                                step="0.01"
                                value={formData.precio_lista}
                                onChange={(e) => setFormData({ ...formData, precio_lista: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="precio_publico">Precio Público</Label>
                            <Input
                                id="precio_publico"
                                type="number"
                                step="0.01"
                                value={formData.precio_publico}
                                onChange={(e) => setFormData({ ...formData, precio_publico: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-1 flex-col">
                            <Label htmlFor="stock">Cantidad</Label>
                            <Label className="mt-3 ml-10">0</Label>
                        </div>
                    </div>

                    <Button type="submit">Guardar</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
