import { useState, useMemo, useEffect } from "react"
import ConsultaExistencia from "./ConsultaExistencia"
import TablaProductos from "./TablaProductos"

import { ProductoLista } from "@/types/inventarios"

const GestionComponent = ({ tipo = 'Entrada', titulo = "Entrada de Productos" }: any) => {
    // Estado para la lista de productos agregados
    const [lista, setLista] = useState<any[]>([])

    // Reinicia la lista si cambia el tipo
    useEffect(() => {
        setLista([])
    }, [tipo])

    // Agrupa productos por categoría
    const productosPorCategoria = useMemo(() => {
        const grupos: { [categoria: string]: any[] } = {};
        lista.forEach(prod => {
            const cat = prod.categoria || "Sin categoría";
            if (!grupos[cat]) grupos[cat] = [];
            grupos[cat].push(prod);
        });
        return grupos;
    }, [lista]);

    // Agregar producto a la lista
    const handleAgregar = (producto: any) => {
        if (!producto) return;
        if (lista.some(p => p.codigo === producto.codigo)) return;
        // Si es salida y stock es 0, no agregar
        if (tipo === "Salida" && producto.stock <= 0) return;
        setLista([...lista, { ...producto, cantidadEntrada: 1 }]);
    };

    // Cambiar cantidad de entrada/salida según tipo
    const handleCantidadEntrada = (codigo: string, cantidad: number) => {
        setLista(lista =>
            lista.map(p => {
                if (p.codigo === codigo) {
                    let nuevaCantidad = cantidad;
                    if (tipo === "Salida") {
                        // Solo permite hasta el stock disponible y mínimo 1, pero si stock es 0, no permite nada
                        if (p.stock <= 0) return { ...p, cantidadEntrada: 0 };
                        nuevaCantidad = Math.max(1, Math.min(cantidad, p.stock));
                    } else {
                        // Entrada: mínimo 1
                        nuevaCantidad = Math.max(1, cantidad);
                    }
                    return { ...p, cantidadEntrada: nuevaCantidad };
                }
                return p;
            })
        );
    };

    // Eliminar producto de la lista
    const handleEliminar = (codigo: string) => {
        setLista(lista => lista.filter(p => p.codigo !== codigo));
    };

    return (
        <section className="mx-auto p-6 space-y-6 border-4 rounded-2xl min-h-screen my-6">
            <h1
                className={`text-2xl font-bold mb-6 ${
                    tipo === "Salida" ? "text-red-700" : "text-green-700"
                }`}
            >
                {titulo}
            </h1>

            <ConsultaExistencia onAgregar={handleAgregar} lista={lista} tipo={tipo} />

            <div className="mt-8">
                <TablaProductos
                    productosPorCategoria={productosPorCategoria}
                    onCantidadEntrada={handleCantidadEntrada}
                    onEliminar={handleEliminar}
                    tipo={tipo}
                />
            </div>

        </section>
    )
}

export default GestionComponent