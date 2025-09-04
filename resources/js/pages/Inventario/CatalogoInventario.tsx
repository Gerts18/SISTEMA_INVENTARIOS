'use client';

import { AddProductModal } from '@/components/inventory/AddProductModal';
import { ProductTable } from '@/components/inventory/ProductTable';
import { EditProductForm } from '@/components/inventory/EditProductForm';
import { PriceHistory } from '@/components/inventory/PriceHistory';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { CirclePlus, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types/auth'
import { Head, usePage } from '@inertiajs/react';

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
    precio_lista: number;
    precio_publico: number;
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

    // Estados para el modal inteligente
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'edit' | 'history' | null;
        producto: Producto | null;
    }>({
        isOpen: false,
        type: null,
        producto: null
    });

    // Estados para actualización masiva de precios
    const [massUpdateModal, setMassUpdateModal] = useState(false);
    const [massUpdateData, setMassUpdateData] = useState({
        proveedor_id: '',
        porcentaje: '',
    });
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [massUpdateLoading, setMassUpdateLoading] = useState(false);
    const [massUpdateError, setMassUpdateError] = useState<string | null>(null);
    const [selectedProviderForUpdate, setSelectedProviderForUpdate] = useState<Proveedor | null>(null);

    // Funciones para manejar las acciones del menú contextual
    const handleEditProduct = (producto: Producto) => {
        // Pequeño delay para evitar conflictos de focus
        setTimeout(() => {
            setModalState({
                isOpen: true,
                type: 'edit',
                producto
            });
        }, 100);
    };

    const handleViewHistory = (producto: Producto) => {
        // Pequeño delay para evitar conflictos de focus
        setTimeout(() => {
            setModalState({
                isOpen: true,
                type: 'history',
                producto
            });
        }, 100);
    };

    const handleModalClose = () => {
        setModalState({
            isOpen: false,
            type: null,
            producto: null
        });
    };

    const handleProductUpdateSuccess = () => {
        // Refrescar la lista de productos después de actualizar
        if (selectedCategoryId) {
            fetchProductsByCategory(selectedCategoryId);
        } else if (selectedProviderId) {
            fetchProductsByProvider(selectedProviderId);
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        handleModalClose();
    };

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

    const handleMassUpdateSubmit = async () => {
        if (!massUpdateData.proveedor_id || !massUpdateData.porcentaje) {
            setMassUpdateError('Debe seleccionar un proveedor y especificar el porcentaje.');
            return;
        }

        const porcentaje = parseFloat(massUpdateData.porcentaje);
        if (porcentaje < 1 || porcentaje > 100) {
            setMassUpdateError('El porcentaje debe estar entre 1 y 100.');
            return;
        }

        // Encontrar el proveedor seleccionado para mostrar en la confirmación
        const proveedor = proveedores.find(p => p.proveedor_id === massUpdateData.proveedor_id);
        setSelectedProviderForUpdate(proveedor || null);
        setMassUpdateError(null);
        setConfirmationModal(true);
    };

    const executeUpdateMassive = async () => {
        setMassUpdateLoading(true);
        setConfirmationModal(false);

        try {
            const response = await axios.post('/inventario/actualizar-precios-masivo', {
                proveedor_id: massUpdateData.proveedor_id,
                porcentaje_aumento: parseFloat(massUpdateData.porcentaje)
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);

            // Cerrar modal y limpiar datos
            setMassUpdateModal(false);
            setMassUpdateData({ proveedor_id: '', porcentaje: '' });
            setSelectedProviderForUpdate(null);

            // Refrescar productos si estamos viendo los del proveedor actualizado
            if (selectedProviderId === massUpdateData.proveedor_id) {
                fetchProductsByProvider(selectedProviderId);
            }

        } catch (error: any) {
            console.error('Error en actualización masiva:', error);
            setMassUpdateError(
                error.response?.data?.message ||
                'Error al actualizar los precios. Intente nuevamente.'
            );
        } finally {
            setMassUpdateLoading(false);
        }
    };

    const handleMassUpdateCancel = () => {
        setMassUpdateModal(false);
        setMassUpdateData({ proveedor_id: '', porcentaje: '' });
        setMassUpdateError(null);
        setSelectedProviderForUpdate(null);
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

            {(userRole === 'Bodega' || userRole === 'Administrador' || userRole === 'Contador') && (
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

            {/* Modal para actualización masiva de precios */}
            {(userRole === 'Bodega' || userRole === 'Administrador') && (
                <Dialog open={massUpdateModal} onOpenChange={setMassUpdateModal}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Actualización masiva de precios
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Actualización masiva de precios</DialogTitle>
                            <DialogDescription>
                                Seleccione un proveedor y el porcentaje de aumento para actualizar todos sus productos.
                            </DialogDescription>
                        </DialogHeader>

                        {massUpdateError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{massUpdateError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="proveedor_update">Proveedor</Label>
                                <SearchableSelect
                                    options={proveedores.map((prov) => ({
                                        value: prov.proveedor_id,
                                        label: prov.nombre,
                                    }))}
                                    value={massUpdateData.proveedor_id}
                                    onChange={(value) =>
                                        setMassUpdateData(prev => ({ ...prev, proveedor_id: value }))
                                    }
                                    placeholder="Seleccione un proveedor"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <Label htmlFor="porcentaje">Porcentaje de aumento (1-100%)</Label>
                                <Input
                                    id="porcentaje"
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="0.1"
                                    placeholder="Ej: 5.5"
                                    value={massUpdateData.porcentaje}
                                    onChange={(e) =>
                                        setMassUpdateData(prev => ({ ...prev, porcentaje: e.target.value }))
                                    }
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Se aplicará tanto al precio de lista como al precio público
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleMassUpdateCancel}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleMassUpdateSubmit}
                                    className="flex-1"
                                    disabled={massUpdateLoading}
                                >
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal de confirmación para actualización masiva */}
            <Dialog open={confirmationModal} onOpenChange={setConfirmationModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Confirmar actualización masiva
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            <strong>¿Está seguro de que desea continuar?</strong>
                            <br /><br />
                            Esta acción actualizará <strong>TODOS</strong> los productos del proveedor:
                            <br />
                            <strong>"{selectedProviderForUpdate?.nombre}"</strong>
                            <br /><br />
                            Porcentaje de aumento: <strong>{massUpdateData.porcentaje}%</strong>
                            <br /><br />
                            Se actualizarán tanto los precios de lista como los precios públicos.
                            <br /><br />
                            <em>Esta acción no se puede deshacer.</em>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmationModal(false)}
                            className="flex-1"
                            disabled={massUpdateLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={executeUpdateMassive}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            disabled={massUpdateLoading}
                        >
                            {massUpdateLoading ? 'Actualizando...' : 'Confirmar actualización'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                        <ProductTable
                            productos={productos}
                            onEditProduct={handleEditProduct}
                            onViewHistory={handleViewHistory}
                        />
                    </div>
                </div>
            </div>

            {/* Modal inteligente para editar productos y ver historial */}
            <Dialog open={modalState.isOpen} onOpenChange={handleModalClose}>
                <DialogContent className={`max-w-4xl ${modalState.type === 'history' ? 'max-h-[90vh]' : 'max-h-[90vh] overflow-y-auto'}`}>
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>
                                    {modalState.type === 'edit' ? 'Editar Producto' : 'Historial de Precios'}
                                    {modalState.producto && (
                                        <span className="text-sm font-normal text-muted-foreground ml-2">
                                            - {modalState.producto.nombre}
                                        </span>
                                    )}
                                </DialogTitle>
                                <DialogDescription>
                                    {modalState.type === 'edit'
                                        ? 'Modifica la información del producto. Los cambios de precio se guardarán automáticamente en el historial.'
                                        : 'Visualiza todos los cambios de precio realizados a este producto.'
                                    }
                                </DialogDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={modalState.type === 'edit' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setModalState(prev => ({ ...prev, type: 'edit' }))}
                                    disabled={!modalState.producto}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant={modalState.type === 'history' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setModalState(prev => ({ ...prev, type: 'history' }))}
                                    disabled={!modalState.producto}
                                >
                                    Historial
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        {modalState.type === 'edit' && modalState.producto && (
                            <EditProductForm
                                producto={modalState.producto}
                                onSuccess={handleProductUpdateSuccess}
                                onCancel={handleModalClose}
                            />
                        )}

                        {modalState.type === 'history' && modalState.producto && (
                            <PriceHistory
                                productoId={modalState.producto.producto_id}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CatalogoInventario;
