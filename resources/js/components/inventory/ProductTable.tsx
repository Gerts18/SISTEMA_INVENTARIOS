import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, History } from 'lucide-react';

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

interface ProductTableProps {
    productos: Producto[];
    className?: string;
    onEditProduct?: (producto: Producto) => void;
    onViewHistory?: (producto: Producto) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
    productos,
    className = '',
    onEditProduct,
    onViewHistory
}) => {
    return (
        <table className={`w-full border ${className}`}>
            <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                    <th className="border px-4 py-2">Nombre</th>
                    <th className="border px-4 py-2">Código</th>
                    <th className="border px-4 py-2">Stock</th>
                    <th className="border px-4 py-2">Precio Lista</th>
                    <th className="border px-4 py-2">Precio Público</th>
                    <th className="border px-4 py-2 w-16">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {productos.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="border px-4 py-8 text-center text-gray-500">
                            No hay productos para mostrar
                        </td>
                    </tr>
                ) : (
                    productos.map((prod) => (
                        <tr key={prod.id || prod.producto_id} className="hover:bg-muted/50">
                            <td className="border px-4 py-2">{prod.nombre}</td>
                            <td className="border px-4 py-2">{prod.codigo}</td>
                            <td className="border px-4 py-2">{prod.stock}</td>
                            <td className="border px-4 py-2">${prod.precio_lista}</td>
                            <td className="border px-4 py-2">${prod.precio_publico}</td>
                            <td className="border px-4 py-2 text-center">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            aria-label={`Acciones para ${prod.nombre}`}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditProduct?.(prod);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Producto
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewHistory?.(prod);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <History className="mr-2 h-4 w-4" />
                                            Ver Historial de Precios
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};
