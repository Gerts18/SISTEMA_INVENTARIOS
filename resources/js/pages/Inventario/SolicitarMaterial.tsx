import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import axios from 'axios'
import jsPDF from 'jspdf'

interface Obra {
  obra_id: number
  nombre: string
}

type AlertType = 'success' | 'error' | 'warning' | null

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
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<AlertType>(null)

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

  const showAlert = (message: string, type: AlertType) => {
    setAlertMessage(message)
    setAlertType(type)
    setTimeout(() => {
      setAlertType(null)
      setAlertMessage('')
    }, 5000)
  }

  const generatePDF =  async (solicitudId: number) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 4
    const maxLineWidth = pageWidth - (margin * 2)
    
    let currentY = margin
    
    // funcion para verificar si necesitamos una nueva página
    const checkPageBreak = (requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - margin) {
        doc.addPage()
        currentY = margin
        return true
      }
      return false
    }
    
    // Funcion para agregar texto con saltos de página automáticos
    const addTextWithPageBreak = (text: string, x: number, fontSize: number = 12, fontStyle: string = 'normal') => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      
      checkPageBreak(fontSize + 2) 
      doc.text(text, x, currentY)
      currentY += fontSize + 2 
    }
    
    // Funcion para agregar texto multilinea con saltos de página
    const addMultilineText = (text: string, x: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text, maxWidth)
      const requiredSpace = lines.length * lineHeight + 5 
      
      checkPageBreak(requiredSpace)
      
      for (let i = 0; i < lines.length; i++) {
        if (currentY + lineHeight > pageHeight - margin) { 
          doc.addPage()
          currentY = margin
        }
        doc.text(lines[i], x, currentY)
        currentY += lineHeight 
      }
      currentY += 1
    }
    
    // Header
    addTextWithPageBreak('SOLICITUD DE MATERIAL', pageWidth / 2, 18, 'bold')
    currentY += 10
    
    // Innfo de la obra en una sola línea
    const selectedObraName = obras.find(obra => obra.obra_id.toString() === selectedObra)?.nombre || ''
    checkPageBreak(20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Obra: ${selectedObraName} | Concepto: ${concepto} | Fecha: ${fecha}`, margin, currentY)
    currentY += 4
    
    // Linea de separación
    checkPageBreak(5) // Reducido de 20 a 10
    doc.line(margin, currentY, pageWidth - margin, currentY)
    currentY += 4
    
    // Secciones de materiales
    const sections = [
      { title: 'HERRAJE', content: herraje },
      { title: 'BARNIZ', content: barniz },
      { title: 'MADERA', content: madera },
      { title: 'EQUIPOS', content: equipos }
    ]
    
    sections.forEach((section, index) => {
      // Checa si necesitamos una nueva página antes de cada sección
      checkPageBreak(40)
      
      // Seccion del título con menos espacio después
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      checkPageBreak(14 + 1)
      doc.text(section.title, margin, currentY)
      currentY += 5 // Reducido espacio después del título
      
      // Seccion del contenido (sin etiqueta "Contenido:")
      const content = section.content || 'Sin contenido'
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      addMultilineText(content, margin, maxLineWidth)

      // Linea de firma
      checkPageBreak(10) 
      doc.setFontSize(10)
      doc.text('Nombre y Firma: ________________________', pageWidth - 140, currentY)
      currentY += 5
      
      // Agrega menos espacio entre secciones
      if (index < sections.length - 1) {
        
        // Opcional: Línea de separación entre secciones
        if (currentY + 5 < pageHeight - margin) {
          doc.setDrawColor(200, 200, 200)
          doc.line(margin, currentY, pageWidth - margin, currentY)
          doc.setDrawColor(0, 0, 0) // Regresa el color a negro
          currentY += 5
        }
      }
    })

    // Convertir PDF a blob
    const pdfBlob = doc.output('blob')
    
    // Crear FormData para enviar el PDF
    const formData = new FormData()
    formData.append('pdf', pdfBlob, `solicitud_${solicitudId}.pdf`)
    
    try {
      // Obtener información de la obra para la ruta
      const selectedObraData = obras.find(obra => obra.obra_id.toString() === selectedObra)
      const obraId = selectedObraData?.obra_id
      const nombreObra = selectedObraData?.nombre.replace(/[^a-zA-Z0-9]/g, '_') // Limpiar nombre para URL
      
      // Subir PDF a S3
      const uploadResponse = await axios.post(
        `/files/solicitud-material/${solicitudId}/${obraId}/${nombreObra}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (uploadResponse.data.success) {
        // Actualizar la solicitud con la URL del PDF
        await axios.put(`/inventario/solicitar-material/${solicitudId}/pdf-url`, {
          pdf_url: uploadResponse.data.url
        })
        
        return uploadResponse.data.url
      } else {
        throw new Error('Error al subir PDF')
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      // Si falla la subida, al menos mostrar el PDF localmente
      /*const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank') */
      throw error
    }

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!selectedObra) {
      showAlert('Por favor selecciona una obra', 'warning')
      return
    }
    
    if (!concepto.trim()) {
      showAlert('Por favor ingresa un concepto', 'warning')
      return
    }
    
    try {
      setLoading(true)
      
      //Primero enviar la solicitud
      
      const response = await axios.post('/inventario/solicitar-material', {
        obra_id: selectedObra,
        concepto,
        fecha_solicitud: fecha,
        herraje,
        barniz,
        madera,
        equipos
      })

      const solicitudId = response.data.solicitud_id
      
      // Luego generar y subir el PDF
      await generatePDF(solicitudId)
      
      /* console.log('Solicitud enviada:', response.data) */
      showAlert('Solicitud enviada correctamente y PDF generado', 'success')

      setSelectedObra('')
      setConcepto('')
      setHerraje('')
      setBarniz('')
      setMadera('')
      setEquipos('')
    } catch (error) {
      console.error('Error sending solicitud:', error)
      showAlert('Error al enviar la solicitud', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-8">
        {/* Alert Component */}
        {alertType && (
          <Alert className={`mb-6 ${
            alertType === 'success' ? 'border-green-500 bg-green-50' :
            alertType === 'error' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            {alertType === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {alertType === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
            {alertType === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
            <AlertDescription className={
              alertType === 'success' ? 'text-green-800' :
              alertType === 'error' ? 'text-red-800' :
              'text-yellow-800'
            }>
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Header with Date */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Fecha {fecha}</h2>
          </div>

          {/* Obra and Concepto Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obra
              </label>
              <Select
                value={selectedObra}
                onValueChange={setSelectedObra}
                disabled={loading}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? 'Cargando obras...' : 'Seleccionar obra...'} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
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
                minLength={1}
              />
            </div>
          </div>

          {/* Material Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Herraje */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Herraje</h3>
              <Textarea
                value={herraje}
                onChange={(e) => setHerraje(e.target.value)}
                placeholder=""
                className="min-h-[250px] md:min-h-[200px] lg:min-h-[200px] resize-none"
              />
            </div>

            {/* Barniz */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Barniz</h3>
              <Textarea
                value={barniz}
                onChange={(e) => setBarniz(e.target.value)}
                placeholder=""
                className="min-h-[250px] md:min-h-[200px] lg:min-h-[200px] resize-none"
              />
            </div>

            {/* Madera */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Madera</h3>
              <Textarea
                value={madera}
                onChange={(e) => setMadera(e.target.value)}
                placeholder=""
                className="min-h-[250px] md:min-h-[200px] lg:min-h-[200px] resize-none"
              />
            </div>

            {/* Equipos */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 text-center">Equipos</h3>
              <Textarea
                value={equipos}
                onChange={(e) => setEquipos(e.target.value)}
                placeholder=""
                className="min-h-[250px] md:min-h-[200px] lg:min-h-[200px] resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedObra || !concepto.trim()}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 w-full md:w-auto"
            >
              {loading ? 'Cargando...' : 'Enviar a bodega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SolicitarMaterial