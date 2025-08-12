import React from 'react';

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
}

export const ProductTable: React.FC<ProductTableProps> = ({ productos, className = '' }) => {
    return (
        <table className={`w-full border ${className}`}>
            <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                    <th className="border px-4 py-2">Nombre</th>
                    <th className="border px-4 py-2">Código</th>
                    <th className="border px-4 py-2">Stock</th>
                    <th className="border px-4 py-2">Precio Lista</th>
                    <th className="border px-4 py-2">Precio Público</th>
                </tr>
            </thead>
            <tbody>
                {productos.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="border px-4 py-8 text-center text-gray-500">
                            No hay productos para mostrar
                        </td>
                    </tr>
                ) : (
                    productos.map((prod) => (
                        <tr key={prod.id || prod.producto_id}>
                            <td className="border px-4 py-2">{prod.nombre}</td>
                            <td className="border px-4 py-2">{prod.codigo}</td>
                            <td className="border px-4 py-2">{prod.stock}</td>
                            <td className="border px-4 py-2">${prod.precio_lista}</td>
                            <td className="border px-4 py-2">${prod.precio_publico}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};
