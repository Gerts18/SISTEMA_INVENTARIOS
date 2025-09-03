import AppLayout from '@/layouts/app-layout'
import { Head, useForm, usePage } from '@inertiajs/react'
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
  autorizado: boolean
  usuario: {
    name: string
  }
}

interface Props {
  autorizaciones: Autorizacion[]
}

const AutorizacionesPage = ({ autorizaciones }: Props) => {
  const [conceptoLength, setConceptoLength] = useState(0)
  
  // Obtaining user info from page props
  const page = usePage<PageProps>();
  
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

  return (
    <AppLayout>
      <Head title='Autorizaciones'/>
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min p-6">
          
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Autorizaciones</h1>
              <p className="text-muted-foreground">Solicita autorizaciones para compras y gestión de inventario</p>
            </div>

            {/* Formulario */}
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

            {/* Lista de Autorizaciones */}
            <div>
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
                          <Badge variant={autorizacion.autorizado ? 'default' : 'secondary'}>
                            {autorizacion.autorizado ? 'Autorizado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}

export default AutorizacionesPage