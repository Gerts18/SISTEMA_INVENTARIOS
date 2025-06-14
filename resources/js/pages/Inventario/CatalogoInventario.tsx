'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { CirclePlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const CatalogoInventario = () => {
    const [categorias, setCategorias] = useState<{ categoria_id: string; nombre: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        stock: 0,
        precio_actual: '',
        categoria_id: '',
    });

    // Cuando se abre el modal, carga las categorías desde el backend
    useEffect(() => {
        if (open) {
            axios
                .get('/inventario/catalogo') // esta es la ruta del método `catalogo()`
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

        console.log('Datos enviados al backend:', payload); // 👈 Esto es lo importante

        router.post(route('inventario.store'), payload, {
            onError: (errors) => {
                console.error('Errores de validación:', errors); // 👈 También esto
            },
            onSuccess: () => {
                console.log('Producto creado exitosamente');
            },
        });
    };

    return (
        <div>
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
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="categoria_id">Categoría</Label>
                            <select
                                id="categoria_id"
                                value={formData.categoria_id}
                                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                                className="w-full rounded border px-3 py-2"
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
                                <Input id="codigo" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
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
