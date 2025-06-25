import { useState, useMemo, useEffect } from "react"
import ConsultaExistencia from "./ConsultaExistencia"
import TablaProductos from "./TablaProductos"
import FileUpload from "@/components/Files/FileUpload"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [alerta, setAlerta] = useState<{ visible: boolean, mensaje: string, tipo: "success" | "error" | "warning" }>({ visible: false, mensaje: "", tipo: "success" })
    const [openDialog, setOpenDialog] = useState(false)

    // Reinicia la lista si cambia el tipo
    useEffect(() => {
        setLista([])
        setSelectedFile(null)
    }, [tipo])

    // Agrupa productos por categoría (ahora usando proveedor.categoria)
    const productosPorCategoria = useMemo(() => {
        const grupos: { [categoria: string]: any[] } = {};
        lista.forEach(prod => {
            // Obtener la categoría desde el proveedor
            const categoria = prod.proveedor_categoria || prod.categoria || "Sin categoría";
            if (!grupos[categoria]) grupos[categoria] = [];
            grupos[categoria].push(prod);
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

    // Validar antes de abrir el diálogo
    const handleContinuarClick = () => {
        if (!selectedFile) {
            setAlerta({ 
                visible: true, 
                mensaje: "Debes seleccionar un archivo comprobante antes de continuar.", 
                tipo: "warning" 
            })

            return false
        }
        setAlerta({ visible: false, mensaje: "", tipo: "success" })
        return true
    }

    // Confirmación y registro
    const handleRegistrar = async () => {
        setLoading(true)
        setAlerta({ visible: false, mensaje: "", tipo: "success" })
        
        try {
            // Crear FormData para enviar archivo junto con datos
            const formData = new FormData()
            formData.append('tipo', tipo)
            formData.append('productos', JSON.stringify(lista.map(({ cantidadEntrada, codigo }) => ({ cantidadEntrada, codigo }))))

            if (selectedFile) {
                formData.append('comprobante', selectedFile)
            }

            const res = await axios.post("/gestion/registrar", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (res.data.success) {
                setAlerta({ 
                    visible: true, 
                    mensaje: "¡Gestión registrada exitosamente! El comprobante ha sido guardado correctamente.", 
                    tipo: "success" 
                })
                setLista([])
                setSelectedFile(null)
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    setAlerta({ visible: false, mensaje: "", tipo: "success" })
                }, 5000)
            } else {
                setAlerta({ 
                    visible: true, 
                    mensaje: res.data.message || "Error al registrar gestión", 
                    tipo: "error" 
                })
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || "Error inesperado al procesar la solicitud"
            setAlerta({ 
                visible: true, 
                mensaje: `Error: ${errorMessage}`, 
                tipo: "error" 
            })
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

            {/* Componente de carga de archivo */}
            {lista.length > 0 && (
                <div className="mt-6">
                    <FileUpload
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                    />
                </div>
            )}

            {/* Mostrar alertas */}
            {alerta.visible && (
                <Alert className={`
                    ${alerta.tipo === 'success' ? 'border-green-200 bg-green-50' : ''}
                    ${alerta.tipo === 'error' ? 'border-red-200 bg-red-50' : ''}
                    ${alerta.tipo === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                `}>
                    {alerta.tipo === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {alerta.tipo === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                    {alerta.tipo === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    <AlertDescription className={`
                        ${alerta.tipo === 'success' ? 'text-green-800' : ''}
                        ${alerta.tipo === 'error' ? 'text-red-800' : ''}
                        ${alerta.tipo === 'warning' ? 'text-yellow-800' : ''}
                    `}>
                        {alerta.mensaje}
                    </AlertDescription>
                </Alert>
            )}

            {/* Botón continuar y alerta */}
            {lista.length > 0 && (
                <div className="flex flex-col items-end mt-6 gap-2">
                    <AlertDialog 
                        open={openDialog} 
                        onOpenChange={(open) => {
                            if (open && !selectedFile) {
                                setAlerta({ 
                                    visible: true, 
                                    mensaje: "Debes seleccionar un archivo comprobante antes de continuar.", 
                                    tipo: "warning" 
                                })
                                return
                            }
                            setOpenDialog(open)
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={loading || !selectedFile}
                                variant={!selectedFile ? "secondary" : "default"}
                                className={`
                                    ${!selectedFile ? 'cursor-not-allowed opacity-50' : ''}
                                `}
                                onClick={(e) => {
                                    if (!selectedFile) {
                                        e.preventDefault()
                                        setAlerta({ 
                                            visible: true, 
                                            mensaje: "Debes seleccionar un archivo comprobante antes de continuar.", 
                                            tipo: "warning" 
                                        })
                                        return
                                    }
                                    setAlerta({ visible: false, mensaje: "", tipo: "success" })
                                }}
                            >
                                {loading ? "Registrando..." : "Continuar"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro de registrar esta gestión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se actualizará el stock y se guardará el registro.
                                    {selectedFile && (
                                        <span className="block mt-2 text-sm font-medium">
                                            Se incluirá el archivo: {selectedFile.name}
                                        </span>
                                    )}
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