import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react"

import { Gestion } from "@/types/gestion"


type Props = {
    gestion: Gestion | null
    onClose: () => void
}

const GestionDetalleModal = ({ gestion, onClose }: Props) => {
    if (!gestion) return null

    // Function to determine if URL is an image
    const isImageUrl = (url: string) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        return imageExtensions.some(ext => url.toLowerCase().includes(ext))
    }

    // Function to get file name from URL
    const getFileNameFromUrl = (url: string) => {
        try {
            const urlParts = url.split('/')
            return urlParts[urlParts.length - 1] || 'Archivo'
        } catch {
            return 'Archivo'
        }
    }

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Detalle de Gestión</DialogTitle>
                <DialogDescription>
                    Información detallada de la gestión de inventario.
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><b>Usuario:</b> {gestion.usuario?.name}</div>
                    <div><b>Rol:</b> {gestion.usuario?.roles?.map(r => r.name).join(', ')}</div>
                    <div><b>Tipo:</b> {gestion.tipo_gestion}</div>
                    <div><b>Fecha:</b> {gestion.fecha}</div>
                </div>

                {/* Voucher Section */}
                {gestion.imagen_comprobante && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {isImageUrl(gestion.imagen_comprobante) ? (
                                    <ImageIcon className="h-5 w-5" />
                                ) : (
                                    <FileText className="h-5 w-5" />
                                )}
                                Comprobante
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isImageUrl(gestion.imagen_comprobante) ? (
                                <div className="space-y-3">
                                    <div className="border rounded-lg overflow-hidden">
                                        <img 
                                            src={gestion.imagen_comprobante} 
                                            alt="Comprobante" 
                                            className="w-full max-h-64 object-contain bg-gray-50"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                                            }}
                                        />
                                        <div 
                                            className="hidden p-4 text-center text-gray-500"
                                        >
                                            No se pudo cargar la imagen
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => window.open(gestion.imagen_comprobante, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Ver imagen en tamaño completo
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <span className="flex-1 text-sm">
                                            {getFileNameFromUrl(gestion.imagen_comprobante)}
                                        </span>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => window.open(gestion.imagen_comprobante, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Abrir archivo
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Productos modificados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Nombre</th>
                                        <th className="text-left py-2">Código</th>
                                        <th className="text-right py-2">Cantidad</th>
                                        <th className="text-right py-2">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gestion.cambios_producto.map((cambio) => {
                                        let precio = cambio.producto?.precio_actual
                                        let precioNum = typeof precio === "string" ? parseFloat(precio) : precio
                                        return (
                                            <tr key={cambio.cambio_producto_id} className="border-b">
                                                <td className="py-2">{cambio.producto?.nombre}</td>
                                                <td className="py-2">{cambio.producto?.codigo}</td>
                                                <td className="text-right py-2">{cambio.cantidad}</td>
                                                <td className="text-right py-2">
                                                    {typeof precioNum === "number" && !isNaN(precioNum)
                                                        ? `$${precioNum.toFixed(2)}`
                                                        : "-"}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogClose>
        </DialogContent>
    )
}

export default GestionDetalleModal
