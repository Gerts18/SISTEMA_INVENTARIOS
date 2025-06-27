'use client';

import { AddProductModal } from '@/components/inventory/AddProductModal';
import { ProductTable } from '@/components/inventory/ProductTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { router } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import axios from 'axios';
import { CirclePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {PageProps} from '@/types/auth'
import {Head, usePage } from '@inertiajs/react';

type Categoria = {
    categoria_id: string;
    nombre: string;
};

type Proveedor = {
    proveedor_id: string;
    nombre: string;
    categoria_id: string | number;
};

type Producto = {
    id: number;
    producto_id: string;
    nombre: string;
    codigo: string;
    stock: number;
    precio_actual: number;
    categoria_id: string | number;
};

type PaginationInfo = {
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    currentPage: number;
};

const CatalogoInventario = () => {
    //Obteniendo rol del usuario
    const page = usePage<PageProps>();
    const userRole = page.props.auth?.role;

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [openProveedor, setOpenProveedor] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        nextPageUrl: null,
        prevPageUrl: null,
        currentPage: 1,
    });
    const [success, setSuccess] = useState(false);
    const [productoId, setProductoId] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedProviderId, setSelectedProviderId] = useState('');
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

    const fetchProductsByCategory = (categoryId: string) => {
        axios
            .get(`/inventario/productos/${categoryId}`)
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
    };

    const fetchProductsByProvider = (providerId: string) => {
        axios
            .get(`/inventario/productos-proveedor/${providerId}`)
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
                setProductos([]);
            });
    };

    const handlePagination = (url: string) => {
        axios.get(url).then((response) => {
            setProductos(response.data.productos);
            setPaginationInfo({
                nextPageUrl: response.data.pagination.next_page,
                prevPageUrl: response.data.pagination.prev_page,
                currentPage: response.data.pagination.current_page,
            });
        });
    };

    useEffect(() => {
        console.log('selectedCategoryId cambió a:', selectedCategoryId);
    }, [selectedCategoryId]);

    const searchProductById = () => {
        if (!productoId) {
            setError('Por favor, ingrese un número de producto.');
            return;
        }

        axios
            .get(`/inventario/buscar/${productoId}`)
            .then((response) => {
                const producto = response.data.producto;
                setProductos([producto]);

                // Buscar la categoría del proveedor del producto
                const proveedor = proveedores.find((prov) => prov.proveedor_id === producto.proveedor_id);

                if (proveedor) {
                    // Seleccionar automáticamente la categoría del proveedor
                    const categoriaId = String(proveedor.categoria_id);
                    setSelectedCategoryId(categoriaId);
                    console.log('Proveedor encontrado:', selectedCategoryId);
                    console.log('Categoría del proveedor:', proveedor.categoria_id);
                } else {
                    console.log('Proveedor no encontrado para el producto');
                    setSelectedCategoryId('');
                }

                setSelectedProviderId(''); // Limpiar selección de proveedor

                // Reset pagination for single product view
                setPaginationInfo({
                    nextPageUrl: null,
                    prevPageUrl: null,
                    currentPage: 1,
                });
            })
            .catch((error) => {
                console.error('Producto no encontrado:', error);
                setProductos([]);
                // También limpiar las selecciones si no se encuentra el producto
                setSelectedCategoryId('');
                setSelectedProviderId('');
            });
    };

    const refreshCurrentProducts = () => {
        if (selectedCategoryId) {
            fetchProductsByCategory(selectedCategoryId);
        } else if (selectedProviderId) {
            fetchProductsByProvider(selectedProviderId);
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedProviderId(''); // Clear provider selection
        fetchProductsByCategory(categoryId);
    };

    const handleProviderSelect = (providerId: string) => {
        setSelectedProviderId(providerId);
        setSelectedCategoryId(''); // Clear category selection

        if (providerId) {
            fetchProductsByProvider(providerId);
        } else {
            setProductos([]);
        }
    };

    const handleProviderSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nombre: formDataProveedor.nombre,
            categoria_id: parseInt(formDataProveedor.categoria_id),
        };

        if (!payload.nombre || !payload.categoria_id) {
            setFormError('Todos los campos son obligatorios.');
            return;
        }

        setFormError(null);

        router.post(route('inventario.storeProveedor'), payload, {
            onError: (errors) => {
                const errorMessage = typeof errors === 'object' && !Array.isArray(errors) ? Object.values(errors).join(', ') : String(errors);
                setFormError(errorMessage);
            },
            onSuccess: () => {
                setOpenProveedor(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                fetchProveedores();
                setFormDataProveedor({ nombre: '', categoria_id: '' });
                setFormError(null);
            },
        });
    };

    useEffect(() => {
        axios
            .get('/inventario/catalogo')
            .then((response) => setCategorias(response.data.categorias))
            .catch((error) => console.error('Error al obtener las categorías:', error));

        fetchProveedores();
    }, []);

    return (
        <div>
            {success && (
                <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>Operación realizada correctamente.</AlertDescription>
                </Alert>
            )}

            {(userRole === 'Bodega' || userRole === 'Administrador') && (
                <AddProductModal
                    proveedores={proveedores}
                    selectedCategoryId={selectedCategoryId}
                    onSuccess={() => {
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 3000);
                    }}
                    onProductCreated={refreshCurrentProducts}
                />
            )}

            {(userRole === 'Bodega' || userRole === 'Administrador') && (
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

                        {formError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}

                        <form className="space-y-4" onSubmit={handleProviderSubmit} autoComplete="off">
                            <div>
                                <Label htmlFor="categoria_id">Categoría</Label>
                                <select
                                    id="categoria_id"
                                    value={formDataProveedor.categoria_id}
                                    onChange={(e) =>
                                        setFormDataProveedor({
                                            ...formDataProveedor,
                                            categoria_id: e.target.value,
                                        })
                                    }
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

                            <div>
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={formDataProveedor.nombre}
                                    onChange={(e) =>
                                        setFormDataProveedor({
                                            ...formDataProveedor,
                                            nombre: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button type="submit">Guardar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            <div className="mt-7">
                {/* Product Search Section */}
                <div className="mb-6 flex items-end gap-4 px-4">
                    <div>
                        <Label className="text-lg font-semibold">Existencia</Label>
                        {error && (
                            <div style={{ animation: 'fadeInOut 3s forwards' }} onAnimationEnd={() => setError(null)}>
                                <Alert variant="destructive" className="mb-4">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                <style>
                                    {`@keyframes fadeInOut {
                                        0% { opacity: 0; }
                                        10% { opacity: 1; }
                                        90% { opacity: 1; }
                                        100% { opacity: 0; }
                                    }`}
                                </style>
                            </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                            <Input
                                placeholder="Número de producto"
                                className="w-48"
                                value={productoId}
                                onChange={(e) => setProductoId(e.target.value)}
                            />
                            <Button type="button" onClick={searchProductById}>
                                Consultar existencia
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Category Selection */}
                <Label className="px-4 text-lg font-semibold">Categoría</Label>
                <div className="mt-4 flex flex-wrap justify-center">
                    {categorias.map((cat) => (
                        <Button
                            key={cat.categoria_id}
                            variant={selectedCategoryId === String(cat.categoria_id) ? 'default' : 'outline'}
                            className="w-64 justify-center text-sm"
                            onClick={() => handleCategorySelect(String(cat.categoria_id))}
                        >
                            {cat.nombre}
                        </Button>
                    ))}
                </div>

                {/* Provider Selection */}
                <div className="mt-7 flex flex-col px-4">
                    <Label className="text-lg font-semibold">Proveedor</Label>
                    <SearchableSelect
                        options={proveedores.map((prov) => ({
                            value: prov.proveedor_id,
                            label: prov.nombre,
                        }))}
                        value={selectedProviderId}
                        onChange={handleProviderSelect}
                        placeholder="Seleccione un proveedor"
                        className="w-60"
                    />
                </div>

                {/* Products Table with Pagination */}
                <div className="mt-7 flex flex-col px-4">
                    <div className="mb-4 flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                            {selectedCategoryId ? 'Productos de esta categoría' : selectedProviderId ? 'Productos del proveedor' : 'Productos'}
                        </Label>

                        {productos.length > 0 && (paginationInfo.nextPageUrl || paginationInfo.prevPageUrl) && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!paginationInfo.prevPageUrl}
                                    onClick={() => paginationInfo.prevPageUrl && handlePagination(paginationInfo.prevPageUrl)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">Página {paginationInfo.currentPage}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!paginationInfo.nextPageUrl}
                                    onClick={() => paginationInfo.nextPageUrl && handlePagination(paginationInfo.nextPageUrl)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <ProductTable productos={productos} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogoInventario;
