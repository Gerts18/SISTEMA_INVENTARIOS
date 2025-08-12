'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

import { Producto, ProductoLista } from "@/types/inventarios"


interface ConsultaExistenciaProps {
    onAgregar: (producto: Producto) => void
    lista: ProductoLista[]
    tipo?: "Entrada" | "Salida"
}

const ConsultaExistencia = ({ onAgregar, lista, tipo = "Entrada" }: ConsultaExistenciaProps) => {
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
            const res = await axios.get(`/gestion/producto-existencia/${encodeURIComponent(productNumber)}`)
            const data = res.data
            setBuscado(true)
            if (data.found) {
                setProducto(data.producto)
                console.log("Producto encontrado:", data.producto)
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

    // Nuevo handler para agregar y limpiar
    const handleAgregarYLimpiar = () => {
        if (producto) {
            onAgregar(producto)
            setProducto(undefined)
            setProductNumber("")
            setBuscado(false)
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
                        disabled={loading || !productNumber || productNumber.length > 6}
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
                                                <div>{(producto as any).categoria}</div>
                                            </div>
                                            {/* Nuevos: Precios */}
                                            <div>
                                                <div className="font-medium">Precio lista</div>
                                                <div>
                                                    {producto.precio_lista !== undefined && producto.precio_lista !== null
                                                        ? `$${producto.precio_lista}`
                                                        : '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Precio público</div>
                                                <div>
                                                    {producto.precio_publico !== undefined && producto.precio_publico !== null
                                                        ? `$${producto.precio_publico}`
                                                        : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-2 flex flex-col sm:flex-row sm:justify-end gap-2">
                                    <Button
                                        className="w-full sm:w-auto"
                                        onClick={handleAgregarYLimpiar}
                                        disabled={
                                            lista.some(p => p.codigo === producto.codigo) ||
                                            (tipo === "Salida" && producto.stock <= 0)
                                        }
                                    >
                                        Agregar a la lista
                                    </Button>
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