'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import axios from 'axios';
import { CirclePlus, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

const CatalogoInventario = () => {
    const [categorias, setCategorias] = useState<{ categoria_id: string; nombre: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [productoId, setProductoId] = useState('');
    type Producto = {
        id: number;
        producto_id: string;
        nombre: string;
        codigo: string;
        stock: number;
        precio_actual: number;
        categoria_id: string | number;
    };
    const [productos, setProductos] = useState<Producto[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        stock: 0,
        precio_actual: '',
        categoria_id: '',
    });

    useEffect(() => {
        axios
            .get('/inventario/catalogo')
            .then((response) => {
                setCategorias(response.data.categorias);
            })
            .catch((error) => {
                console.error('Error al obtener las categorías:', error);
            });
    }, []);

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
                const categoriaSeleccionada = formData.categoria_id;
                setFormData({
                    nombre: '',
                    codigo: '',
                    stock: 0,
                    precio_actual: '',
                    categoria_id: categoriaSeleccionada,
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
            <div className="mt-7">
                <div className="mb-6 flex items-end gap-4 px-4">
                    <div>
                        <Label className="text-lg font-semibold" htmlFor="numero_producto">
                            Existencia
                        </Label>
                        <div className="mt-2 flex items-center gap-2">
                            <Input
                                id="producto_id"
                                type="number"
                                placeholder="Número de producto"
                                min={1}
                                className="w-48"
                                value={productoId}
                                onChange={(e) => setProductoId(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={() => {
                                    if (!productoId) {
                                        setError('Por favor, ingrese un número de producto.');
                                        return;
                                    }
                                    axios
                                        .get(`/inventario/buscar/${productoId}`)
                                        .then((response) => {
                                            const producto = response.data.producto;
                                            setFormData((prev) => ({
                                                ...prev,
                                                categoria_id: producto.categoria_id.toString(),
                                            }));
                                            setProductos([producto]);
                                        })
                                        .catch((error) => {
                                            console.error('Producto no encontrado:', error);
                                            setProductos([]);
                                        });
                                }}
                            >
                                Consultar existencia
                            </Button>
                        </div>
                    </div>
                </div>
                <Label className="px-4 text-lg font-semibold">Categoria</Label>
                <div className="mt-4 flex flex-wrap justify-center">
                    {categorias.map((cat) => (
                        <Button
                            key={cat.categoria_id}
                            variant={formData.categoria_id === cat.categoria_id ? 'default' : 'outline'}
                            className={`w-64 justify-center text-sm ${formData.categoria_id === cat.categoria_id ? 'border-blue-500 bg-blue-100 text-blue-700' : ''}`}
                            onClick={() => {
                                setFormData({ ...formData, categoria_id: cat.categoria_id });
                                axios
                                    .get(`/inventario/productos/${cat.categoria_id}`)
                                    .then((response) => {
                                        setProductos(response.data.productos);
                                    })
                                    .catch((error) => {
                                        console.error('Error al obtener los productos:', error);
                                    });
                            }}
                        >
                            {cat.nombre}
                        </Button>
                    ))}
                </div>

                <div className="mt-6">
                    <Label className="text-lg font-semibold">
                        <span>Productos de esta categoría </span>
                        <button
                            className="ml-2 align-middle text-black hover:text-gray-700 focus:outline-none"
                            onClick={() => {
                                if (formData.categoria_id) {
                                    axios
                                        .get(`/inventario/productos/${formData.categoria_id}`)
                                        .then((response) => {
                                            setProductos(response.data.productos);
                                        })
                                        .catch((error) => {
                                            console.error('Error al obtener los productos:', error);
                                        });
                                } else {
                                    console.log('Selecciona una categoría para actualizar los productos.');
                                }
                            }}
                        >
                            <RefreshCcw className="inline h-10 w-4 align-middle" />
                        </button>
                    </Label>
                    <table className="mt-2 w-full border">
                        <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-800">
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Código</th>
                                <th className="border px-4 py-2">Stock</th>
                                <th className="border px-4 py-2">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((prod) => (
                                <tr key={prod.id || prod.producto_id}>
                                    <td className="border px-4 py-2">{prod.nombre}</td>
                                    <td className="border px-4 py-2">{prod.codigo}</td>
                                    <td className="border px-4 py-2">{prod.stock}</td>
                                    <td className="border px-4 py-2">${prod.precio_actual}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CatalogoInventario;
