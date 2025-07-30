import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from 'axios'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Set today's date
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setFecha(formattedDate)

    // Fetch obras
    fetchObras()
  }, [])

  const fetchObras = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/inventario/solicitar-material/obras')
      setObras(response.data)
    } catch (error) {
      console.error('Error fetching obras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await axios.post('/inventario/solicitar-material', {
        obra_id: selectedObra,
        concepto,
        fecha_solicitud: fecha,
        herraje,
        barniz,
        madera,
        equipos
      })
      
      console.log('Solicitud enviada:', response.data)
      alert('Solicitud enviada correctamente')
      
      // Reset form
      setSelectedObra('')
      setConcepto('')
      setHerraje('')
      setBarniz('')
      setMadera('')
      setEquipos('')
    } catch (error) {
      console.error('Error sending solicitud:', error)
      alert('Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
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
              <Select
                value={selectedObra}
                onValueChange={setSelectedObra}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? 'Cargando obras...' : 'Seleccionar obra...'} />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.obra_id} value={obra.obra_id.toString()}>
                      {obra.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concepto
              </label>
              <Input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ingrese el concepto..."
                required
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
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
            >
              {loading ? 'Enviando...' : 'Enviar a bodega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SolicitarMaterial