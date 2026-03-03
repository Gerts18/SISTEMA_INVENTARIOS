import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription } from '@radix-ui/react-dialog';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeftRight, CalendarIcon, Send, Undo2, CheckCircle, Clock, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type { Entrega, EntregaDetalle, EntregaTransicion } from '@/types/entregas';

interface UsuarioOption {
    id: number;
    name: string;
    role: string;
}

interface ViewEntregaModalProps {
    entrega: Entrega | null;
    isOpen: boolean;
    onClose: () => void;
    userRole: string;
    currentUserId: number;
}

export const ViewEntregaModal: React.FC<ViewEntregaModalProps> = ({
    entrega,
    isOpen,
    onClose,
    userRole,
    currentUserId,
}) => {
    const [detalleEntrega, setDetalleEntrega] = useState<EntregaDetalle | null>(null);
    const [transiciones, setTransiciones] = useState<EntregaTransicion[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estado para la acción
    const [selectedEstado, setSelectedEstado] = useState<string>('no_recibido');
    const [selectedDestinatario, setSelectedDestinatario] = useState<string>('');
    const [comentarioDevolucion, setComentarioDevolucion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && entrega) {
            loadDetalle(entrega.entrega_id);
            loadUsuarios();
            setSelectedEstado(entrega.transicion_actual?.estado || 'no_recibido');
            setSelectedDestinatario('');
            setComentarioDevolucion('');
            setError(null);
            setSuccess(null);
        }
    }, [isOpen, entrega]);

    const loadDetalle = async (entregaId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(route('entregas.detalle', { entregaId }));
            if (response.data.success) {
                setDetalleEntrega(response.data.entrega);
                setTransiciones(response.data.transiciones);
            }
        } catch (err) {
            console.error('Error loading detalle:', err);
            setError('Error al cargar el detalle de la entrega.');
        } finally {
            setLoading(false);
        }
    };

    const loadUsuarios = async () => {
        try {
            const response = await axios.get(route('entregas.usuarios'));
            setUsuarios(response.data);
        } catch (err) {
            console.error('Error loading usuarios:', err);
        }
    };

    const usuariosOptions = useMemo(() => {
        return usuarios
            .filter(u => u.id !== currentUserId)
            .map(user => ({
                value: String(user.id),
                label: `${user.name} (${user.role})`,
            }));
    }, [usuarios, currentUserId]);

    const isMyEntrega = entrega?.transicion_actual?.destinatario?.id === currentUserId;
    const isChofer = userRole === 'Chofer';
    const isCompleted = entrega?.estado_general === 'completado';
    const transicionActual = entrega?.transicion_actual;

    const handleUpdateEstado = async (nuevoEstado: string) => {
        if (!transicionActual) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await axios.patch(
                route('entregas.updateEstado', { transicionId: transicionActual.transicion_id }),
                { estado: nuevoEstado }
            );
            if (response.data.success) {
                setSelectedEstado(nuevoEstado);
                setSuccess('Estado actualizado.');
                setTimeout(() => setSuccess(null), 2000);
                // Reload detail
                if (entrega) loadDetalle(entrega.entrega_id);
                router.reload({ only: ['entregas'] });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar el estado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEnviar = async () => {
        if (!entrega || !selectedDestinatario) {
            setError('Debe seleccionar un destinatario.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await axios.post(
                route('entregas.enviar', { entregaId: entrega.entrega_id }),
                {
                    destinatario_id: Number(selectedDestinatario),
                    fecha: new Date().toISOString().split('T')[0],
                }
            );
            if (response.data.success) {
                setSuccess('Entrega enviada correctamente.');
                setTimeout(() => {
                    onClose();
                    router.reload({ only: ['entregas'] });
                }, 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar la entrega.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDevolver = async () => {
        if (!entrega) return;
        if (!comentarioDevolucion.trim()) {
            setError('El comentario es obligatorio para devolver.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await axios.post(
                route('entregas.devolver', { entregaId: entrega.entrega_id }),
                { comentario: comentarioDevolucion }
            );
            if (response.data.success) {
                setSuccess('Entrega devuelta correctamente.');
                setTimeout(() => {
                    onClose();
                    router.reload({ only: ['entregas'] });
                }, 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al devolver la entrega.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompletar = async () => {
        if (!entrega) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await axios.post(
                route('entregas.completar', { entregaId: entrega.entrega_id })
            );
            if (response.data.success) {
                setSuccess('Entrega completada correctamente.');
                setTimeout(() => {
                    onClose();
                    router.reload({ only: ['entregas'] });
                }, 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al completar la entrega.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'recibido':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'faltante':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'no_recibido':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoText = (estado: string) => {
        switch (estado) {
            case 'recibido':
                return 'Recibido';
            case 'faltante':
                return 'Faltante';
            case 'no_recibido':
                return 'No recibido';
            default:
                return estado;
        }
    };

    const getEstadoGeneralBadge = (estado: string) => {
        switch (estado) {
            case 'en_curso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completado':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!entrega) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Detalle de Entrega</DialogTitle>
                    <DialogDescription>Información completa de la entrega de material.</DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert variant="default" className="mb-4 border-green-400 bg-green-100 text-green-700">
                        <AlertTitle>Éxito</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Cargando detalle...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Información de la entrega */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{entrega.titulo}</h3>
                                <Badge className={getEstadoGeneralBadge(entrega.estado_general)}>
                                    {entrega.estado_general === 'en_curso' ? 'En Curso' : 'Completado'}
                                </Badge>
                            </div>

                            {(() => {
                                const desc = detalleEntrega?.descripcion ?? entrega.descripcion;
                                return desc ? (
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Descripción</p>
                                        <p className="text-sm">{desc}</p>
                                    </div>
                                ) : null;
                            })()}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">Obra:</span>
                                    <span>{entrega.obra.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">Creado por:</span>
                                    <span>{entrega.creador.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">Fecha creación:</span>
                                    <span>{new Date(entrega.created_at).toLocaleDateString('es-ES')}</span>
                                </div>
                                {transicionActual && (
                                    <div className="flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium">Enviado por:</span>
                                        <span>{transicionActual.remitente.name}</span>
                                    </div>
                                )}
                            </div>

                            {transicionActual && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Estado actual:</span>
                                    <Badge className={getEstadoBadge(transicionActual.estado)}>
                                        {getEstadoText(transicionActual.estado)}
                                    </Badge>
                                    {transicionActual.es_devolucion && (
                                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                                            Devolución
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Comentario de devolución si existe */}
                            {transicionActual?.comentario && transicionActual.es_devolucion && (
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                    <p className="text-sm font-medium text-orange-800">Comentario de devolución:</p>
                                    <p className="text-sm text-orange-700 mt-1">{transicionActual.comentario}</p>
                                </div>
                            )}
                        </div>

                        {/* Acciones del destinatario - solo si la entrega es mía y no está completada */}
                        {isMyEntrega && !isCompleted && transicionActual && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Acciones</h4>

                                    {/* Selector de Estado */}
                                    <div>
                                        <Label>Marcar como:</Label>
                                        <Select
                                            value={selectedEstado}
                                            onValueChange={(value) => handleUpdateEstado(value)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className="w-full sm:w-64">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no_recibido">No recibido</SelectItem>
                                                <SelectItem value="recibido">Recibido</SelectItem>
                                                <SelectItem value="faltante">Faltante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Si Chofer y marcado como Recibido -> Completar */}
                                    {(isChofer || userRole === 'Administrador') && selectedEstado === 'recibido' && (
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleCompletar}
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto gap-2"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                {isSubmitting ? 'Completando...' : 'Marcar como Completado'}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Si NO es Chofer y marcado como Recibido -> Enviar */}
                                    {!isChofer && userRole !== 'Administrador' && selectedEstado === 'recibido' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label>Enviar a Usuario:</Label>
                                                <SearchableSelect
                                                    options={usuariosOptions}
                                                    value={selectedDestinatario}
                                                    onChange={setSelectedDestinatario}
                                                    placeholder="Seleccione siguiente destinatario"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleEnviar}
                                                    disabled={isSubmitting || !selectedDestinatario}
                                                    className="w-full sm:w-auto gap-2"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin que NO es Chofer: puede también enviar */}
                                    {userRole === 'Administrador' && selectedEstado === 'recibido' && (
                                        <div className="space-y-3">
                                            <Separator />
                                            <p className="text-sm text-muted-foreground">O enviar a otro usuario:</p>
                                            <div>
                                                <Label>Enviar a Usuario:</Label>
                                                <SearchableSelect
                                                    options={usuariosOptions}
                                                    value={selectedDestinatario}
                                                    onChange={setSelectedDestinatario}
                                                    placeholder="Seleccione siguiente destinatario"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleEnviar}
                                                    disabled={isSubmitting || !selectedDestinatario}
                                                    className="w-full sm:w-auto gap-2"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {isSubmitting ? 'Enviando...' : 'Enviar a otro'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Si Faltante -> Devolver */}
                                    {selectedEstado === 'faltante' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label>
                                                    Comentario <span className="text-red-500">*</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({comentarioDevolucion.length}/1000 caracteres)
                                                    </span>
                                                </Label>
                                                <Textarea
                                                    value={comentarioDevolucion}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 1000) {
                                                            setComentarioDevolucion(e.target.value);
                                                        }
                                                    }}
                                                    placeholder="Describa el motivo de la devolución..."
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDevolver}
                                                    disabled={isSubmitting || !comentarioDevolucion.trim()}
                                                    className="w-full sm:w-auto gap-2"
                                                >
                                                    <Undo2 className="h-4 w-4" />
                                                    {isSubmitting ? 'Devolviendo...' : 'Devolver'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Historial de transiciones */}
                        {transiciones.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Historial de Transiciones</h4>
                                    <div className="space-y-2">
                                        {transiciones.map((t) => (
                                            <div
                                                key={t.transicion_id}
                                                className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium">{t.remitente.name}</span>
                                                        <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{t.destinatario.name}</span>
                                                        <Badge className={`${getEstadoBadge(t.estado)} text-xs`}>
                                                            {getEstadoText(t.estado)}
                                                        </Badge>
                                                        {t.es_devolucion && (
                                                            <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                                                                Devolución
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {new Date(t.fecha).toLocaleDateString('es-ES')} - {new Date(t.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {t.comentario && (
                                                        <p className="text-muted-foreground italic mt-1">
                                                            "{t.comentario}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
