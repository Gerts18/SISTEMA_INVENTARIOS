import { useState, useMemo, useEffect } from "react"
import ConsultaExistencia from "./ConsultaExistencia"
import TablaProductos from "./TablaProductos"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const GestionComponent = ({ tipo = 'Entrada', titulo = "Entrada de Productos" }: any) => {
    // Estado para la lista de productos agregados
    const [lista, setLista] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [alerta, setAlerta] = useState<{ visible: boolean, mensaje: string, tipo: "success" | "error" }>({ visible: false, mensaje: "", tipo: "success" })
    const [openDialog, setOpenDialog] = useState(false)

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

    // Confirmación y registro
    const handleRegistrar = async () => {
        setLoading(true)
        setAlerta({ visible: false, mensaje: "", tipo: "success" })
        try {
            const res = await axios.post("/gestion/registrar", {
                tipo,
                productos: lista.map(({ cantidadEntrada, codigo }) => ({ cantidadEntrada, codigo }))
            })
            if (res.data.success) {
                setAlerta({ visible: true, mensaje: "¡Gestión registrada exitosamente!", tipo: "success" })
                setLista([])
            } else {
                setAlerta({ visible: true, mensaje: res.data.message || "Error al registrar gestión", tipo: "error" })
            }
        } catch (e: any) {
            setAlerta({ visible: true, mensaje: e.response?.data?.message || "Error inesperado", tipo: "error" })
        } finally {
            setLoading(false)
            setOpenDialog(false)
        }
    }

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

            {/* Botón continuar y alerta */}
            {lista.length > 0 && (
                <div className="flex flex-col items-end mt-6 gap-2">
                    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={loading}
                            >
                                {loading ? "Registrando..." : "Continuar"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro de registrar esta gestión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se actualizará el stock y se guardará el registro.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRegistrar}
                                    disabled={loading}
                                >
                                    {loading ? "Registrando..." : "Confirmar"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </section>
    )
}

export default GestionComponent