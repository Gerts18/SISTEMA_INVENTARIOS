import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Building, FileText, Download, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'

interface Solicitud {
  solicitud_id: number
  fecha_solicitud: string
  concepto: string
  reporte_generado_url: string | null
  created_at: string
  obra: {
    obra_id: number
    nombre: string
  }
  usuario: {
    id: number
    name: string
    roles: string[]
  }
}

interface PaginationData {
  data: Solicitud[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  has_more_pages: boolean
}

const SolicitudesDeMaterial = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<Omit<PaginationData, 'data'> | null>(null)
  const [perPage] = useState(9) // 9 items per page for grid layout

  useEffect(() => {
    fetchSolicitudes(currentPage)
  }, [currentPage])

  const fetchSolicitudes = async (page: number) => {
    try {
      setLoading(true)
      const response = await axios.get(`/inventario/solicitudes-material/data?page=${page}&per_page=${perPage}`)
      const paginatedData: PaginationData = response.data
      setSolicitudes(paginatedData.data)
      setPaginationInfo({
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        per_page: paginatedData.per_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
        has_more_pages: paginatedData.has_more_pages,
      })
    } catch (error) {
      console.error('Error fetching solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleVerMas = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setModalOpen(true)
  }

  const handleDownloadPDF = async (url: string, solicitudId: number) => {
    if (!url) return
    
    try {
      setPdfLoading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `solicitud_material_${solicitudId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setPdfLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando solicitudes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Material</h1>
          {paginationInfo && (
            <p className="text-gray-600">
              Mostrando {paginationInfo.from || 0} - {paginationInfo.to || 0} de {paginationInfo.total} solicitudes
            </p>
          )}
        </div>

        {solicitudes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
              <p className="text-gray-500">No se han encontrado solicitudes de material</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solicitudes.map((solicitud) => (
                <Card key={solicitud.solicitud_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">#{solicitud.solicitud_id}</CardTitle>
                      <Badge variant={solicitud.reporte_generado_url ? "default" : "secondary"}>
                        {solicitud.reporte_generado_url ? "Con PDF" : "Sin PDF"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {formatDateTime(solicitud.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(solicitud.fecha_solicitud)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium truncate">{solicitud.obra.nombre}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm truncate">{solicitud.usuario.name}</span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        <strong>Concepto:</strong> {solicitud.concepto}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button 
                        onClick={() => handleVerMas(solicitud)}
                        className="w-full"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver más
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {paginationInfo && paginationInfo.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-2">
                  {/* Previous page */}
                  {currentPage > 2 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {currentPage > 3 && <span className="text-gray-400">...</span>}
                    </>
                  )}

                  {/* Previous page number */}
                  {currentPage > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </Button>
                  )}

                  {/* Current page */}
                  <Button variant="default" size="sm" disabled>
                    {currentPage}
                  </Button>

                  {/* Next page number */}
                  {currentPage < paginationInfo.last_page && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </Button>
                  )}

                  {/* Next pages */}
                  {currentPage < paginationInfo.last_page - 1 && (
                    <>
                      {currentPage < paginationInfo.last_page - 2 && <span className="text-gray-400">...</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(paginationInfo.last_page)}
                      >
                        {paginationInfo.last_page}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationInfo.last_page}
                  size="sm"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Solicitud de Material #{selectedSolicitud?.solicitud_id}</DialogTitle>
              <DialogDescription>
                Creada el {selectedSolicitud && formatDateTime(selectedSolicitud.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSolicitud && (
              <div className="space-y-6">
                {/* Información de la solicitud */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Solicitud</label>
                      <p className="text-sm font-medium">{formatDate(selectedSolicitud.fecha_solicitud)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Obra</label>
                      <p className="text-sm font-medium">{selectedSolicitud.obra.nombre}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Concepto</label>
                      <p className="text-sm">{selectedSolicitud.concepto}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Solicitado por</label>
                      <p className="text-sm font-medium">{selectedSolicitud.usuario.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rol</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedSolicitud.usuario.roles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Section */}
                {selectedSolicitud.reporte_generado_url ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Documento PDF</h3>
                      <Button
                        onClick={() => handleDownloadPDF(selectedSolicitud.reporte_generado_url!, selectedSolicitud.solicitud_id)}
                        disabled={pdfLoading}
                        size="sm"
                      >
                        {pdfLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Descargar PDF
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={selectedSolicitud.reporte_generado_url}
                        className="w-full h-96"
                        title="Vista previa del PDF"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay documento PDF disponible para esta solicitud</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default SolicitudesDeMaterial