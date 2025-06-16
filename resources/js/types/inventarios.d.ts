export interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    stock: number;
    categoria: string;
    precio_actual: number;
}

export interface ProductoLista extends Producto {
    cantidadEntrada: number;
}