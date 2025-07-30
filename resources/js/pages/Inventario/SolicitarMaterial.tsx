import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface Obra {
  obra_id: number
  nombre: string
}

const SolicitarMaterial = () => {
  const [fecha, setFecha] = useState('')
  const [obras, setObras] = useState<Obra[]>([])
  const [selectedObra, setSelectedObra] = useState('')
  const [concepto, setConcepto] = useState('')
  const [herraje, setHerraje] = useState('')
  const [barniz, setBarniz] = useState('')
  const [madera, setMadera] = useState('')
  const [equipos, setEquipos] = useState('')

  useEffect(() => {
    // Set today's date
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setFecha(formattedDate)

    // Fetch obras (placeholder for now)
    // fetchObras()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', {
      fecha,
      selectedObra,
      concepto,
      herraje,
      barniz,
      madera,
      equipos
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit}>
          {/* Header with Date */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Fecha {fecha}</h2>
          </div>

          {/* Obra and Concepto Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obra
              </label>
              <select
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar obra...</option>
                {obras.map((obra) => (
                  <option key={obra.obra_id} value={obra.obra_id}>
                    {obra.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concepto
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el concepto..."
              />
            </div>
          </div>

          {/* Material Categories Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Herraje */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Herraje</h3>
              <Textarea
                value={herraje}
                onChange={(e) => setHerraje(e.target.value)}
                placeholder=""
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Barniz */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Barniz</h3>
              <Textarea
                value={barniz}
                onChange={(e) => setBarniz(e.target.value)}
                placeholder=""
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Madera */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Madera</h3>
              <Textarea
                value={madera}
                onChange={(e) => setMadera(e.target.value)}
                placeholder=""
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Equipos */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Equipos</h3>
              <Textarea
                value={equipos}
                onChange={(e) => setEquipos(e.target.value)}
                placeholder=""
                className="min-h-[200px] resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
            >
              Enviar a bodega
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SolicitarMaterial