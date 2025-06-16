import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
                  <th className="px-2 py-1 border hidden md:table-cell">Precio</th>
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
                    <td className="px-2 py-1 border hidden md:table-cell">{prod.precio_actual ?? '-'}</td>
                    <td className="px-2 py-1 border">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={tipo === "Salida" && prod.stock <= 0 ? 0 : 1}
                          max={tipo === "Salida" ? prod.stock : undefined}
                          value={
                            tipo === "Salida" && prod.stock <= 0
                              ? 0
                              : prod.cantidadEntrada
                          }
                          disabled={tipo === "Salida" && prod.stock <= 0}
                          onChange={e => {
                            let val = parseInt(e.target.value, 10) || 1
                            if (tipo === "Salida") {
                              if (prod.stock <= 0) {
                                onCantidadEntrada(prod.codigo, 0)
                                return
                              }
                              val = Math.max(1, Math.min(val, prod.stock))
                            } else {
                              val = Math.max(1, val)
                            }
                            onCantidadEntrada(prod.codigo, val)
                          }}
                          className="w-24"
                        />
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
                    <span className="font-medium">Precio:</span> {prod.precio_actual ?? '-'}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{columnaCantidad}:</span>
                  <Input
                    type="number"
                    min={tipo === "Salida" && prod.stock <= 0 ? 0 : 1}
                    max={tipo === "Salida" ? prod.stock : undefined}
                    value={
                      tipo === "Salida" && prod.stock <= 0
                        ? 0
                        : prod.cantidadEntrada
                    }
                    disabled={tipo === "Salida" && prod.stock <= 0}
                    onChange={e => {
                      let val = parseInt(e.target.value, 10) || 1
                      if (tipo === "Salida") {
                        if (prod.stock <= 0) {
                          onCantidadEntrada(prod.codigo, 0)
                          return
                        }
                        val = Math.max(1, Math.min(val, prod.stock))
                      } else {
                        val = Math.max(1, val)
                      }
                      onCantidadEntrada(prod.codigo, val)
                    }}
                    className="w-20"
                  />
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