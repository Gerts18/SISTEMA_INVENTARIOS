'use client';

import { AddProductModal } from '@/components/inventory/AddProductModal';
import { ProductTable } from '@/components/inventory/ProductTable';
import { EditProductForm } from '@/components/inventory/EditProductForm';
import { PriceHistory } from '@/components/inventory/PriceHistory';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types/auth'
import { Head, usePage } from '@inertiajs/react';

type Producto = {
    id: number;
    producto_id: string;
    nombre: string;
    codigo: string;
    stock: number;
    precio_lista: number;
    precio_publico: number;
};

type PaginationInfo = {
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    currentPage: number;
};

const CatalogoInventario = () => {
    // Obteniendo rol del usuario
    const page = usePage<PageProps>();
    const userRole = page.props.auth?.role;

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = más recientes primero
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        nextPageUrl: null,
        prevPageUrl: null,
        currentPage: 1,
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

    // Funciones para manejar las acciones del menú contextual
    const handleEditProduct = (producto: Producto) => {
        setTimeout(() => {
            setModalState({
                isOpen: true,
                type: 'edit',
                producto
            });
        }, 100);
    };

    const handleViewHistory = (producto: Producto) => {
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
        loadProducts();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        handleModalClose();
    };

    // Cargar productos con paginación
    const loadProducts = () => {
        axios
            .get(`/inventario/listar-productos?orden=${sortOrder}`)
            .then((response) => {
                setProductos(response.data.productos);
                setPaginationInfo({
                    nextPageUrl: response.data.pagination.next_page,
                    prevPageUrl: response.data.pagination.prev_page,
                    currentPage: response.data.pagination.current_page,
                });
                setError(null);
            })
            .catch((error) => {
                console.error('Error al obtener los productos:', error);
                setError('Error al cargar los productos.');
            });
    };

    // Buscar productos por nombre
    const searchProductsByName = () => {
        if (!searchTerm.trim()) {
            // Si está vacío, mostrar todos los productos
            loadProducts();
            setHasSearched(false);
            return;
        }

        setHasSearched(true);
        axios
            .get(`/inventario/buscar/${encodeURIComponent(searchTerm.trim())}`)
            .then((response) => {
                setProductos(response.data.productos);
                // Reset pagination for search results
                setPaginationInfo({
                    nextPageUrl: null,
                    prevPageUrl: null,
                    currentPage: 1,
                });
                setError(null);
            })
            .catch((error) => {
                console.error('Productos no encontrados:', error);
                setProductos([]);
                setError(error.response?.data?.message || 'No se encontraron productos.');
                setTimeout(() => setError(null), 3000);
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

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            searchProductsByName();
        }
    };

    useEffect(() => {
        loadProducts();
    }, [sortOrder]); // Recargar cuando cambia el orden

    return (
        <div className="container mx-auto p-4">
            <Head title="Catálogo de Inventario" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Catálogo de Inventario</h1>
                <p className="text-muted-foreground">
                    Gestiona los productos de tu inventario
                </p>
            </div>

            {success && (
                <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>Operación realizada correctamente.</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Botones de acción */}
            <div className="mb-6 space-y-2 max-w-md">
                {(userRole === 'Bodega' || userRole === 'Administrador' || userRole === 'Contador') && (
                    <AddProductModal
                        onSuccess={() => {
                            setSuccess(true);
                            setTimeout(() => setSuccess(false), 3000);
                        }}
                        onProductCreated={loadProducts}
                    />
                )}
            </div>

            {/* Sección de búsqueda */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-lg font-semibold">Buscar Producto</Label>

                    {/* Filtro de ordenamiento */}
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Ordenar:</Label>
                        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                            <SelectTrigger className="w-52">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Más recientes primero</SelectItem>
                                <SelectItem value="asc">Más antiguos primero</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2 max-w-2xl">
                    <Input
                        placeholder="Buscar por nombre del producto..."
                        className="flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                    />
                    <Button type="button" onClick={searchProductsByName}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSearchTerm('');
                            setHasSearched(false);
                            loadProducts();
                        }}
                    >
                        Ver Todos
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    Busca productos por su nombre. Puedes buscar nombres parciales.
                </p>
            </div>

            {/* Tabla de productos con paginación */}
            <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                    <Label className="text-lg font-semibold">
                        Productos {hasSearched && `(resultados para "${searchTerm}")`}
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
                    {productos.length > 0 ? (
                        <ProductTable
                            productos={productos}
                            onEditProduct={handleEditProduct}
                            onViewHistory={handleViewHistory}
                            userRole={userRole}
                        />
                    ) : (
                        <div className="text-center py-12 border rounded-lg">
                            <p className="text-muted-foreground">
                                {searchTerm ? 'No se encontraron productos.' : 'No hay productos registrados.'}
                            </p>
                        </div>
                    )}
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
