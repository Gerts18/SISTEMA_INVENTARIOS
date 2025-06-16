import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Producto } from "@/types/inventarios"

import { CambioProducto, Usuario, Gestion } from "@/types/gestion"


type Props = {
    gestion: Gestion | null
    onClose: () => void
}

const GestionDetalleModal = ({ gestion, onClose }: Props) => {
    if (!gestion) return null

    return (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Detalle de Gestión</DialogTitle>
                <DialogDescription>
                    Información detallada de la gestión de inventario.
                </DialogDescription>
            </DialogHeader>
            <div className="mb-1"><b>Usuario:</b> {gestion.usuario?.name}</div>
            <div className="mb-1"><b>Rol:</b> {gestion.usuario?.roles?.map(r => r.name).join(', ')}</div>
            <div className="mb-1"><b>Tipo:</b> {gestion.tipo_gestion}</div>
            <div className="mb-1"><b>Fecha:</b> {gestion.fecha}</div>
            <div className="mt-4">
                <b>Productos modificados:</b>
                <table className="w-full mt-2 text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">Nombre</th>
                            <th className="text-left">Código</th>
                            <th className="text-right">Cantidad</th>
                            <th className="text-right">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gestion.cambios_producto.map((cambio) => {
                            let precio = cambio.producto?.precio_actual
                            let precioNum = typeof precio === "string" ? parseFloat(precio) : precio
                            return (
                                <tr key={cambio.cambio_producto_id}>
                                    <td>{cambio.producto?.nombre}</td>
                                    <td>{cambio.producto?.codigo}</td>
                                    <td className="text-right">{cambio.cantidad}</td>
                                    <td className="text-right">
                                        {typeof precioNum === "number" && !isNaN(precioNum)
                                            ? precioNum.toFixed(2)
                                            : "-"}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>Cerrar</Button>
            </DialogClose>
        </DialogContent>
    )
}

export default GestionDetalleModal
