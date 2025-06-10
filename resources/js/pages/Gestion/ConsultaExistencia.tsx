'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { router } from '@inertiajs/react'

// Simulación de productos
const productos = [
    {
        codigo: "00001",
        nombre: "Lijas",
        stock: 22,
        categoria: "Madera"
    },
    {
        codigo: "00002",
        nombre: "Martillo",
        stock: 10,
        categoria: "Herramientas"
    }
    // ...puedes agregar más productos simulados aquí
]

const ConsultaExistencia = ({ producto, flash }: any) => {

    const [productNumber, setProductNumber] = useState("00001")

    const handleConsultar = () => {
        router.visit(route('producto.consultar'), {
            method: 'get',
            data: { codigo: productNumber },
            only: ['producto', 'flash'],
            preserveScroll: true,
        })
    }

    const buscado = producto !== undefined || (flash && flash.error);

    return (
        <Card>
            <CardHeader>
                <CardTitle>EXISTENCIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="product-number">Numero de Producto</Label>
                        <Input
                            id="product-number"
                            value={productNumber}
                            onChange={(e) => setProductNumber(e.target.value)}
                            className="w-32"
                        />
                    </div>
                    <Button onClick={handleConsultar}>Consultar Existencia</Button>
                </div>

                {/* Resultado de la búsqueda */}
                {buscado && (
                    <div className="mt-4">
                        {producto ? (
                            <>
                                <h3 className="text-blue-600 font-medium mb-2">Producto encontrado</h3>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-4 gap-4 text-sm">
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
                                <div className="mt-2 flex justify-end">
                                    <Button>Agregar a la lista</Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-600 font-medium">
                                {flash?.error || "No se encontró el producto."}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ConsultaExistencia