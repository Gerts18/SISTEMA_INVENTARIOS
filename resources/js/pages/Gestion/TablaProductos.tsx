import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

import { ProductoLista } from "@/types/inventarios"

interface TablaProductosProps {
  productosPorCategoria: { [categoria: string]: ProductoLista[] }
  onCantidadEntrada: (codigo: string, cantidad: number) => void
  onEliminar: (codigo: string) => void
  tipo?: "Entrada" | "Salida"
}

const TablaProductos = ({
  productosPorCategoria,
  onCantidadEntrada,
  onEliminar,
  tipo = "Entrada",
}: TablaProductosProps) => {
  // Nombre de columna según tipo
  const columnaCantidad =
    tipo === "Salida" ? "Cantidad a retirar" : "Cantidad a ingresar"

  // Función para incrementar cantidad
  const handleIncrement = (codigo: string, currentValue: number, maxStock?: number) => {
    let newValue = currentValue + 1
    if (tipo === "Salida" && maxStock !== undefined) {
      newValue = Math.min(newValue, maxStock)
    }
    onCantidadEntrada(codigo, newValue)
  }

  // Función para decrementar cantidad
  const handleDecrement = (codigo: string, currentValue: number, stock: number) => {
    if (tipo === "Salida" && stock <= 0) {
      onCantidadEntrada(codigo, 0)
      return
    }
    const newValue = Math.max(1, currentValue - 1)
    onCantidadEntrada(codigo, newValue)
  }

  return (
    <div>
      {Object.entries(productosPorCategoria).map(([categoria, productos]) => (
        <div key={categoria} className="mb-6">
          <div className="font-semibold text-blue-700 mb-2">{categoria}</div>
          {/* Responsive table wrapper */}
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 bg-zinc-100">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">Nombre</th>
                  <th className="px-2 py-1 border hidden sm:table-cell">Código</th>
                  <th className="px-2 py-1 border hidden md:table-cell">Cantidad disponible</th>
                  {/* Reemplazo: dos columnas de precio */}
                  <th className="px-2 py-1 border hidden md:table-cell">Precio Lista</th>
                  <th className="px-2 py-1 border hidden md:table-cell">Precio Público</th>
                  <th className="px-2 py-1 border">Proveedor</th>
                  <th className="px-2 py-1 border">{columnaCantidad}</th>
                  <th className="px-2 py-1 border"></th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod.codigo} className="bg-white even:bg-gray-50">
                    <td className="px-2 py-1 border">{prod.nombre}</td>
                    <td className="px-2 py-1 border hidden sm:table-cell">{prod.codigo}</td>
                    <td className="px-2 py-1 border hidden md:table-cell">{prod.stock}</td>
                    {/* Nuevas celdas de precio */}
                    <td className="px-2 py-1 border hidden md:table-cell">
                      {(prod as any)?.precio_lista !== undefined && (prod as any)?.precio_lista !== null
                        ? `$${(prod as any).precio_lista}`
                        : '-'}
                    </td>
                    <td className="px-2 py-1 border hidden md:table-cell">
                      {(prod as any)?.precio_publico !== undefined && (prod as any)?.precio_publico !== null
                        ? `$${(prod as any).precio_publico}`
                        : '-'}
                    </td>
                    <td className="px-2 py-1 border">{(prod as any).proveedor_nombre ?? '-'}</td>
                    <td className="px-2 py-1 border">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            tipo === "Salida" && prod.stock <= 0 ||
                            prod.cantidadEntrada <= 1
                          }
                          onClick={() => handleDecrement(prod.codigo, prod.cantidadEntrada, prod.stock)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2 min-w-[2rem] text-center font-medium">
                          {tipo === "Salida" && prod.stock <= 0 ? 0 : prod.cantidadEntrada}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            tipo === "Salida" && (prod.stock <= 0 || prod.cantidadEntrada >= prod.stock)
                          }
                          onClick={() => handleIncrement(prod.codigo, prod.cantidadEntrada, prod.stock)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 py-1 border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onEliminar(prod.codigo)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> 
          {/* Mobile cards */}
          <div className="sm:hidden mt-4 space-y-3">
            {productos.map(prod => (
              <div key={prod.codigo} className="rounded-lg border p-3 bg-white shadow-sm">
                <div className="font-semibold">{prod.nombre}</div>
                <div className="text-xs text-gray-500 mb-2">{prod.codigo}</div>
                <div className="flex flex-wrap gap-2 text-sm mb-2">
                  <div>
                    <span className="font-medium">Disponible:</span> {prod.stock}
                  </div>
                  <div>
                    <span className="font-medium">Precio lista:</span>{" "}
                    {(prod as any)?.precio_lista !== undefined && (prod as any)?.precio_lista !== null
                      ? `$${(prod as any).precio_lista}`
                      : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Precio público:</span>{" "}
                    {(prod as any)?.precio_publico !== undefined && (prod as any)?.precio_publico !== null
                      ? `$${(prod as any).precio_publico}`
                      : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Proveedor:</span> {(prod as any).proveedor_nombre ?? '-'}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{columnaCantidad}:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        tipo === "Salida" && prod.stock <= 0 ||
                        prod.cantidadEntrada <= 1
                      }
                      onClick={() => handleDecrement(prod.codigo, prod.cantidadEntrada, prod.stock)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 min-w-[2rem] text-center font-medium">
                      {tipo === "Salida" && prod.stock <= 0 ? 0 : prod.cantidadEntrada}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        tipo === "Salida" && (prod.stock <= 0 || prod.cantidadEntrada >= prod.stock)
                      }
                      onClick={() => handleIncrement(prod.codigo, prod.cantidadEntrada, prod.stock)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onEliminar(prod.codigo)}
                  className="w-full"
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TablaProductos