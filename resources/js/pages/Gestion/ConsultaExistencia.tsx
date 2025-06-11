'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Producto } from "@/types/inventarios"

const ConsultaExistencia = () => {

    const [productNumber, setProductNumber] = useState("")
    const [producto, setProducto] = useState<Producto | undefined>(undefined)
    const [buscado, setBuscado] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleConsultar = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true)
        setBuscado(false)
        setProducto(undefined)
        try {
            const res = await fetch(`/gestion/producto-existencia/${encodeURIComponent(productNumber)}`)
            const data = await res.json()
            setBuscado(true)
            if (data.found) {
                setProducto(data.producto)
            } else {
                setProducto(undefined)
            }
        } catch (err) {
            setProducto(undefined)
            setBuscado(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>EXISTENCIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-end">
                    
                    <div className="space-y-2">
                        <Label htmlFor="product-number">Numero de Producto</Label>
                        <Input
                            id="product-number"
                            value={productNumber}
                            onChange={(e) => setProductNumber(e.target.value)}
                            className="w-full sm:w-32"
                        />
                    </div>

                    <Button 
                        onClick={handleConsultar} 
                        disabled={loading || !productNumber}
                        className="w-full sm:w-auto"
                    >
                        {loading ? "Consultando..." : "Consultar Existencia"}
                    </Button>

                </div>

                {/* Resultado de la búsqueda */}
                {buscado && (
                    <div className="mt-4">
                        {producto ? (
                            <>
                                <h3 className="text-blue-600 font-medium mb-2">Producto encontrado</h3>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="font-medium">Nombre</div>
                                                <div>{producto.nombre}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Codigo</div>
                                                <div>{producto.codigo}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Cantidad disponible</div>
                                                <div>{producto.stock} piezas</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Categoria</div>
                                                <div>{producto.categoria}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-2 flex flex-col sm:flex-row sm:justify-end gap-2">
                                    <Button className="w-full sm:w-auto">Agregar a la lista</Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-600 font-medium">
                                {"Producto no encontrado"}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ConsultaExistencia