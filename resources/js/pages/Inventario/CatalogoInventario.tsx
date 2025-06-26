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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ProductTable } from '@/components/inventory/ProductTable';
import { AddProductModal } from '@/components/inventory/AddProductModal';

const CatalogoInventario = () => {
    const [categorias, setCategorias] = useState<{ categoria_id: string; nombre: string }[]>([]);
    const [proveedores, setProveedores] = useState<{ proveedor_id: string; nombre: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [openProveedor, setOpenProveedor] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paginationInfo, setPaginationInfo] = useState({
        nextPageUrl: null as string | null,
        prevPageUrl: null as string | null,
        currentPage: 1,
    });
    const [success, setSuccess] = useState(false);
    const [productoId, setProductoId] = useState('');
    const [formData, setFormData] = useState({
        proveedor_id: '',
        nombre: '',
        codigo: '',
        stock: 0,
        precio_actual: '',
        categoria_id: '',
    });
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
    const [formDataProveedor, setFormDataProveedor] = useState({
        nombre: '',
        categoria_id: '',
    });

    const fetchProveedores = () => {
        axios
            .get('/inventario/proveedores')
            .then((response) => {
                setProveedores(response.data.proveedores);
            })
            .catch((error) => {
                console.error('Error al obtener los proveedores:', error);
            });
    };

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

    useEffect(() => {
        fetchProveedores();
    }, []);

    const handleSubmitProveedor = (e: React.FormEvent) => {
        e.preventDefault();

        // Preparar los datos que se enviarán al backend
        const payload = {
            nombre: formDataProveedor.nombre,
            categoria_id: parseInt(formDataProveedor.categoria_id), // Convertir a entero
        };

        console.log('Datos enviados al backend:', payload);

        try {
            // Validación básica antes de enviar los datos
            if (!payload.nombre || !payload.categoria_id) {
                setFormError('Todos los campos son obligatorios.');
                return;
            }
        } catch (error) {
            setFormError('Error de validación. Por favor, revisa los datos ingresados.');
            return;
        }

        // Limpiar cualquier error previo
        setFormError(null);

        // Enviar los datos al backend
        router.post(route('inventario.storeProveedor'), payload, {
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
                console.log('Proveedor creado exitosamente');
                setOpenProveedor(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);

                // Actualizar la lista de proveedores
                fetchProveedores();

                // Limpiar el formulario
                setFormDataProveedor({
                    nombre: '',
                    categoria_id: '',
                });
            },
        });
    };

    const refreshCurrentProducts = () => {
        // Si hay una categoría seleccionada, actualizar productos de esa categoría
        if (formData.categoria_id) {
            axios
                .get(`/inventario/productos/${formData.categoria_id}`)
                .then((response) => {
                    setProductos(response.data.productos);
                    setPaginationInfo({
                        nextPageUrl: response.data.pagination.next_page,
                        prevPageUrl: response.data.pagination.prev_page,
                        currentPage: response.data.pagination.current_page,
                    });
                })
                .catch((error) => {
                    console.error('Error al obtener los productos:', error);
                });
        }
        // Si hay un proveedor seleccionado (sin categoría), actualizar productos de ese proveedor
        else if (formData.proveedor_id) {
            axios
                .get(`/inventario/productos-proveedor/${formData.proveedor_id}`)
                .then((response) => {
                    setProductos(response.data.productos);
                    setPaginationInfo({
                        nextPageUrl: response.data.pagination.next_page,
                        prevPageUrl: response.data.pagination.prev_page,
                        currentPage: response.data.pagination.current_page,
                    });
                })
                .catch((error) => {
                    console.error('Error al obtener productos del proveedor:', error);
                });
        }
    };

    return (
        <div>
            {success && (
                <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>Producto agregado correctamente.</AlertDescription>
                </Alert>
            )}
            
            <AddProductModal
                proveedores={proveedores}
                selectedCategoryId={formData.categoria_id}
                onSuccess={() => {
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                }}
                onProductCreated={refreshCurrentProducts}
            />

            <Dialog open={openProveedor} onOpenChange={setOpenProveedor}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Agregar proveedor
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar nuevo proveedor</DialogTitle>
                        <DialogDescription>Complete los campos del formulario para registrar un nuevo proveedor.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmitProveedor} autoComplete="off">
                        <div>
                            <Label htmlFor="categoria_id">Categoría</Label>
                            <select
                                id="categoria_id"
                                value={formDataProveedor.categoria_id}
                                onChange={(e) => setFormDataProveedor({ ...formDataProveedor, categoria_id: e.target.value })}
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
                                <Input
                                    id="nombre"
                                    value={formDataProveedor.nombre}
                                    onChange={(e) => setFormDataProveedor({ ...formDataProveedor, nombre: e.target.value })}
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
                        {error && (
                            <div
                                style={{
                                    animation: 'fadeInOut 3s forwards',
                                }}
                                onAnimationEnd={() => setError(null)}
                            >
                                <Alert variant="destructive" className="mb-4">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                <style>
                                    {`
                                    @keyframes fadeInOut {
                                        0% { opacity: 0; }
                                        10% { opacity: 1; }
                                        90% { opacity: 1; }
                                        100% { opacity: 0; }
                                    }
                                    `}
                                </style>
                            </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                            <Input
                                id="producto_id"
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
                            className={`w-64 justify-center text-sm`}
                            onClick={() => {
                                setFormData({ ...formData, categoria_id: cat.categoria_id });
                                axios
                                    .get(`/inventario/productos/${cat.categoria_id}`)
                                    .then((response) => {
                                        setProductos(response.data.productos);
                                        setPaginationInfo({
                                            nextPageUrl: response.data.pagination.next_page,
                                            prevPageUrl: response.data.pagination.prev_page,
                                            currentPage: response.data.pagination.current_page,
                                        });
                                        console.log('Productos actualizados:', response);
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
                                            setPaginationInfo({
                                                nextPageUrl: response.data.pagination.next_page,
                                                prevPageUrl: response.data.pagination.prev_page,
                                                currentPage: response.data.pagination.current_page,
                                            });
                                            console.log('Productos actualizados:', response);
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
                        <div className="mt-4 flex justify-between">
                            <Button
                                disabled={!paginationInfo.prevPageUrl}
                                onClick={() => {
                                    if (paginationInfo.prevPageUrl) {
                                        axios.get(paginationInfo.prevPageUrl).then((response) => {
                                            setProductos(response.data.productos);
                                            setPaginationInfo({
                                                nextPageUrl: response.data.pagination.next_page,
                                                prevPageUrl: response.data.pagination.prev_page,
                                                currentPage: response.data.pagination.current_page,
                                            });
                                        });
                                    }
                                }}
                            >
                                Anterior
                            </Button>
                            <span>Página {paginationInfo.currentPage}</span>
                            <Button
                                disabled={!paginationInfo.nextPageUrl}
                                onClick={() => {
                                    if (paginationInfo.nextPageUrl) {
                                        axios.get(paginationInfo.nextPageUrl).then((response) => {
                                            setProductos(response.data.productos);
                                            setPaginationInfo({
                                                nextPageUrl: response.data.pagination.next_page,
                                                prevPageUrl: response.data.pagination.prev_page,
                                                currentPage: response.data.pagination.current_page,
                                            });
                                        });
                                    }
                                }}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </Label>
                    <ProductTable productos={productos} className="mt-2" />
                </div>
            </div>
        </div>
    );
};

export default CatalogoInventario;