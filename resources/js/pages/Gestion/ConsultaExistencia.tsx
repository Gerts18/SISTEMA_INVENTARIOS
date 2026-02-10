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
    const [searchTerm, setSearchTerm] = useState("")
    const [producto, setProducto] = useState<Producto | undefined>(undefined)
    const [sugerencias, setSugerencias] = useState<Producto[]>([])
    const [buscado, setBuscado] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSugerencias, setShowSugerencias] = useState(false)

    // Buscar sugerencias mientras se escribe
    const handleSearchChange = async (value: string) => {
        setSearchTerm(value)
        setBuscado(false)
        setProducto(undefined)

        if (value.trim().length < 1) {
            setSugerencias([])
            setShowSugerencias(false)
            return
        }

        try {
            const res = await axios.get(`/gestion/buscar-productos/${encodeURIComponent(value)}`)
            setSugerencias(res.data.productos || [])
            setShowSugerencias(true)
        } catch (err) {
            setSugerencias([])
        }
    }

    // Seleccionar un producto de las sugerencias
    const handleSelectSugerencia = (prod: Producto) => {
        setProducto(prod)
        setSearchTerm(prod.nombre)
        setSugerencias([])
        setShowSugerencias(false)
        setBuscado(true)
    }

    // Buscar producto
    const handleConsultar = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true)
        setBuscado(false)
        setProducto(undefined)
        setShowSugerencias(false)

        try {
            // Primero intentar buscar por nombre
            const res = await axios.get(`/gestion/buscar-productos/${encodeURIComponent(searchTerm)}`)
            const data = res.data
            setBuscado(true)

            if (data.productos && data.productos.length > 0) {
                // Si hay resultados, mostrar el primero
                setProducto(data.productos[0])
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
            setSearchTerm("")
            setBuscado(false)
            setSugerencias([])
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>BUSCAR PRODUCTO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-end">
                    <div className="space-y-2 flex-1 relative">
                        <Label htmlFor="product-search">Nombre del Producto</Label>
                        <Input
                            id="product-search"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => sugerencias.length > 0 && setShowSugerencias(true)}
                            onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                            placeholder="Ej: Cemento, Varilla, etc."
                            className="w-full"
                            maxLength={100}
                        />

                        {/* Lista de sugerencias */}
                        {showSugerencias && sugerencias.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {sugerencias.map((sug) => (
                                    <div
                                        key={sug.codigo}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                        onClick={() => handleSelectSugerencia(sug)}
                                    >
                                        <div className="font-medium">{sug.nombre}</div>
                                        <div className="text-sm text-gray-500">
                                            Código: {sug.codigo} | Stock: {sug.stock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleConsultar}
                        disabled={loading || !searchTerm || searchTerm.length < 1}
                        className="w-full sm:w-auto"
                    >
                        {loading ? "Consultando..." : "Buscar"}
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