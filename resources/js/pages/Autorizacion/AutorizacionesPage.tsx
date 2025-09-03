import AppLayout from '@/layouts/app-layout'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { PageProps } from '@/types/auth'

interface Autorizacion {
  id: number
  concepto: string
  fecha: string
  estado: 'pendiente' | 'autorizado' | 'rechazado'
  usuario: {
    name: string
  }
}

interface Props {
  autorizaciones: Autorizacion[]
  todasLasAutorizaciones: Autorizacion[]
}

const AutorizacionesPage = ({ autorizaciones, todasLasAutorizaciones }: Props) => {
  const [conceptoLength, setConceptoLength] = useState(0)
  const [adminView, setAdminView] = useState<"mis-solicitudes" | "todas-solicitudes">("mis-solicitudes")
  
  // Obteniendo rol del usuario - igual que en InventarioPage
  const page = usePage<PageProps>();
  const userRole = page.props.auth?.role;
  
  const { data, setData, post, processing, errors, reset } = useForm({
    concepto: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('autorizaciones.store'), {
      onSuccess: () => {
        reset()
        setConceptoLength(0)
      }
    })
  }

  const handleConceptoChange = (value: string) => {
    setData('concepto', value)
    setConceptoLength(value.length)
  }

  const handleApprove = (autorizacionId: number, newEstado: 'autorizado' | 'rechazado') => {
    router.patch(route('autorizaciones.updateStatus', autorizacionId), {
      estado: newEstado
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // Optional: Add success message handling
      }
    })
  }

  return (
    <AppLayout>
      <Head title='Autorizaciones'/>
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
          
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Autorizaciones</h1>
              <p className="text-muted-foreground">
                {userRole === 'Administrador' 
                  ? 'Solicita y gestiona autorizaciones para compras y gestión de inventario'
                  : 'Solicita autorizaciones para compras y gestión de inventario'
                }
              </p>
            </div>

            {/* Toggle para Administrador - solo mostrar si es Administrador */}
            {userRole === 'Administrador' && (
              <div className="flex gap-2 p-3 border rounded-lg bg-muted/40">
                <button
                  onClick={() => setAdminView("mis-solicitudes")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition ${
                    adminView === "mis-solicitudes"
                      ? "bg-primary text-white border-primary"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  Mis Solicitudes
                </button>
                <button
                  onClick={() => setAdminView("todas-solicitudes")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition ${
                    adminView === "todas-solicitudes"
                      ? "bg-primary text-white border-primary"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  Gestionar Autorizaciones
                </button>
              </div>
            )}

            {/* Mostrar formulario solo en "mis-solicitudes" o para usuarios no-admin */}
            {(userRole !== 'Administrador' || adminView === "mis-solicitudes") && (
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Solicitud de Autorización</CardTitle>
                  <CardDescription>
                    Describe el concepto de la autorización que necesitas (máximo 200 caracteres)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="concepto">Concepto</Label>
                      <Textarea
                        id="concepto"
                        placeholder="Describe el concepto de la autorización..."
                        value={data.concepto}
                        onChange={(e) => handleConceptoChange(e.target.value)}
                        maxLength={200}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{errors.concepto && <span className="text-red-500">{errors.concepto}</span>}</span>
                        <span className={conceptoLength > 180 ? 'text-orange-500' : ''}>
                          {conceptoLength}/200
                        </span>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={processing || !data.concepto.trim()}>
                      {processing ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de Autorizaciones */}
            <div>
              {userRole === 'Administrador' && adminView === "todas-solicitudes" ? (
                // Vista de administrador - todas las autorizaciones
                <>
                  <h2 className="text-xl font-semibold mb-4">Gestionar Autorizaciones</h2>
                  <div className="space-y-3">
                    {todasLasAutorizaciones && todasLasAutorizaciones.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">No hay solicitudes de autorización</p>
                        </CardContent>
                      </Card>
                    ) : (
                      todasLasAutorizaciones?.map((autorizacion) => (
                        <Card key={autorizacion.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">{autorizacion.concepto}</p>
                                <p className="text-xs text-muted-foreground">
                                  Por: {autorizacion.usuario.name} • {new Date(autorizacion.fecha).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={autorizacion.estado === 'autorizado' ? 'default' : autorizacion.estado === 'rechazado' ? 'destructive' : 'secondary'}>
                                  {autorizacion.estado === 'autorizado' ? 'Autorizado' : 
                                   autorizacion.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                                </Badge>
                                {autorizacion.estado === 'pendiente' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                      onClick={() => handleApprove(autorizacion.id, 'autorizado')}
                                    >
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                      onClick={() => handleApprove(autorizacion.id, 'rechazado')}
                                    >
                                      Rechazar
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              ) : (
                // Vista normal - mis solicitudes
                <>
                  <h2 className="text-xl font-semibold mb-4">Mis Solicitudes Enviadas</h2>
                  <div className="space-y-3">
                    {autorizaciones.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">No tienes solicitudes de autorización</p>
                        </CardContent>
                      </Card>
                    ) : (
                      autorizaciones.map((autorizacion) => (
                        <Card key={autorizacion.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">{autorizacion.concepto}</p>
                                <p className="text-xs text-muted-foreground">
                                  Enviado el: {new Date(autorizacion.fecha).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={autorizacion.estado === 'autorizado' ? 'default' : autorizacion.estado === 'rechazado' ? 'destructive' : 'secondary'}>
                                {autorizacion.estado === 'autorizado' ? 'Autorizado' : 
                                 autorizacion.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}

export default AutorizacionesPage