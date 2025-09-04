import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

interface Producto {
    id: number;
    producto_id: string;
    nombre: string;
    codigo: string;
    stock: number;
    precio_lista: number;
    precio_publico: number;
    categoria_id: string | number;
}

interface EditProductFormProps {
    producto: Producto;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const EditProductForm: React.FC<EditProductFormProps> = ({
    producto,
    onSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        nombre: producto.nombre,
        stock: producto.stock,
        precio_lista: producto.precio_lista,
        precio_publico: producto.precio_publico,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.patch(`/inventario/productos/${producto.producto_id}`, formData);

            if (response.data.success) {
                // Cerrar inmediatamente y dejar que el componente padre maneje el éxito
                onSuccess?.();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Error al actualizar el producto');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                            id="codigo"
                            value={producto.codigo}
                            disabled
                            className="bg-muted"
                        />
                        <span className="text-xs text-muted-foreground">
                            El código no se puede modificar
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="nombre">Nombre del Producto</Label>
                        <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            disabled
                            className="bg-muted"
                        />
                        <span className="text-xs text-muted-foreground">
                            El stock no se puede modificar
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="precio_lista">Precio Lista</Label>
                        <Input
                            id="precio_lista"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.precio_lista}
                            onChange={(e) => handleInputChange('precio_lista', parseFloat(e.target.value) || 0)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="precio_publico">Precio Público</Label>
                        <Input
                            id="precio_publico"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.precio_publico}
                            onChange={(e) => handleInputChange('precio_publico', parseFloat(e.target.value) || 0)}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
