export interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    stock: number;
    categoria: string;
    precio_lista: number;
    precio_publico: number;
}

export interface ProductoLista extends Producto {
    cantidadEntrada: number;
    proveedor_nombre?: string;
}