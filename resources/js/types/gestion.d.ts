export interface CambioProducto  {
    cambio_producto_id: number
    cantidad: number
    producto: Producto
}

export interface Usuario  {
    id: number
    name: string
    roles: { name: string }[]
}

export interface Gestion  {
    gestion_inv_id: number
    usuario: Usuario
    tipo_gestion: string
    fecha: string
    cambios_producto: CambioProducto[]
    imagen_comprobante?: string
}

export interface Props  {
    gestiones: Gestion[]
}