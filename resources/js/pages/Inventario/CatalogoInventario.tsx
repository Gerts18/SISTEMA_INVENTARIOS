'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import axios from 'axios';
import { CirclePlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const CatalogoInventario = () => {
    const [categorias, setCategorias] = useState<{ categoria_id: string; nombre: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        stock: 0,
        precio_actual: '',
        categoria_id: '',
    });

    useEffect(() => {
        if (open) {
            axios
                .get('/inventario/catalogo')
                .then((response) => {
                    setCategorias(response.data.categorias);
                })
                .catch((error) => {
                    console.error('Error al obtener las categorías:', error);
                });
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            categoria_id: parseInt(formData.categoria_id),
            stock: Number(formData.stock),
            precio_actual: parseFloat(formData.precio_actual),
        };

        console.log('Datos enviados al backend:', payload);

        try {
            if (!payload.nombre || !payload.codigo || !payload.categoria_id || !payload.precio_actual) {
                setError('Todos los campos son obligatorios.');
                return;
            }
        } catch (error) {
            setError('Error de validación. Por favor, revisa los datos ingresados.');
            return;
        }

        setError(null);

        router.post(route('inventario.store'), payload, {
            onError: (errors) => {
                console.error('Errores de validación:', errors);
                let errorMessage = '';
                if (typeof errors === 'object' && !Array.isArray(errors)) {
                    errorMessage = Object.values(errors).join(', ');
                } else {
                    errorMessage = String(errors);
                }

                setError(` ${errorMessage}`);
            },
            onSuccess: () => {
                console.log('Producto creado exitosamente');
                setOpen(false);
                setSuccess(true);
                setFormData({
                    nombre: '',
                    codigo: '',
                    stock: 0,
                    precio_actual: '',
                    categoria_id: '',
                });
                setTimeout(() => setSuccess(false), 3000);
            },
        });
    };

    return (
        <div>
            {success && (
                <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>Producto agregado correctamente.</AlertDescription>
                </Alert>
            )}
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

                    {/* Mostrar el Alert si hay un error */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                        <div>
                            <Label htmlFor="categoria_id">Categoría</Label>
                            <select
                                id="categoria_id"
                                value={formData.categoria_id}
                                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                                className="w-full rounded border bg-white px-3 py-2 text-black dark:bg-zinc-900 dark:text-white"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.categoria_id} value={cat.categoria_id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
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
                                        // Solo permitir números y máximo 6 caracteres
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setFormData({ ...formData, codigo: value });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-1 flex-col">
                                <Label htmlFor="stock">Cantidad</Label>
                                <Label className="mt-3 ml-10">0</Label>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="precio_actual">Precio por unidad</Label>
                                <Input
                                    id="precio_actual"
                                    type="number"
                                    step="0.01"
                                    value={formData.precio_actual}
                                    onChange={(e) => setFormData({ ...formData, precio_actual: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit">Guardar</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CatalogoInventario;
