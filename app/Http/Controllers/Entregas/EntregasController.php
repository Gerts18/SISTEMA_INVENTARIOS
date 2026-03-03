<?php

namespace App\Http\Controllers\Entregas;

use App\Events\EntregaActualizadaEvent;
use App\Http\Controllers\Controller;
use App\Models\Entregas\Entrega;
use App\Models\Entregas\EntregaTransicion;
use App\Models\Obras\Obra;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EntregasController extends Controller
{
    /**
     * Muestra la página principal de entregas.
     */
    public function show(Request $request)
    {
        $perPage = $request->get('per_page', 12);
        $search = $request->get('search', '');
        $status = $request->get('status', 'todas');

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userRole = $user->getRoleNames()->first();

        // Obtener entregas donde el usuario es destinatario de la transición activa
        // o donde el usuario es el creador
        $query = Entrega::with([
            'obra:obra_id,nombre',
            'creador:id,name',
            'transicionActual.remitente:id,name',
            'transicionActual.destinatario:id,name',
        ]);

        // Filtrar entregas relevantes para el usuario actual
        $query->where(function ($q) use ($user) {
            // Entregas donde soy destinatario de la transición activa
            $q->whereHas('transicionActual', function ($sub) use ($user) {
                $sub->where('destinatario_id', $user->id);
            })
                // O entregas que yo creé
                ->orWhere('creador_id', $user->id);
        });

        // Filtro por estado general
        if ($status && $status !== 'todas') {
            $query->where('estado_general', $status);
        }

        // Filtro de búsqueda por título u obra
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', '%' . $search . '%')
                    ->orWhereHas('obra', function ($sub) use ($search) {
                        $sub->where('nombre', 'like', '%' . $search . '%');
                    });
            });
        }

        $entregas = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Mapear datos para el frontend
        $mappedData = $entregas->getCollection()->map(function ($entrega) use ($user) {
            $transicionActual = $entrega->transicionActual;

            return [
                'entrega_id' => $entrega->entrega_id,
                'titulo' => $entrega->titulo,
                'descripcion' => $entrega->descripcion,
                'estado_general' => $entrega->estado_general,
                'created_at' => $entrega->created_at,
                'obra' => [
                    'obra_id' => $entrega->obra->obra_id,
                    'nombre' => $entrega->obra->nombre,
                ],
                'creador' => [
                    'id' => $entrega->creador->id,
                    'name' => $entrega->creador->name,
                ],
                'transicion_actual' => $transicionActual ? [
                    'transicion_id' => $transicionActual->transicion_id,
                    'estado' => $transicionActual->estado,
                    'fecha' => $transicionActual->fecha,
                    'comentario' => $transicionActual->comentario,
                    'es_devolucion' => $transicionActual->es_devolucion,
                    'remitente' => [
                        'id' => $transicionActual->remitente->id,
                        'name' => $transicionActual->remitente->name,
                    ],
                    'destinatario' => [
                        'id' => $transicionActual->destinatario->id,
                        'name' => $transicionActual->destinatario->name,
                    ],
                ] : null,
                'es_mi_entrega' => $transicionActual && $transicionActual->destinatario_id === $user->id,
            ];
        });

        $entregas->setCollection($mappedData);

        return Inertia::render('Entregas/EntregasPage', [
            'entregas' => $entregas,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'userRole' => $user->getRoleNames()->first(),
        ]);
    }

    /**
     * Obtiene las obras activas para el selector.
     */
    public function getObras()
    {
        $obras = Obra::select('obra_id', 'nombre')
            ->where('estado', 'en_progreso')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($obras);
    }

    /**
     * Obtiene los usuarios con roles de Produccion, Barniz, Chofer.
     */
    public function getUsuarios()
    {
        $usuarios = User::role(['Produccion', 'Barniz', 'Chofer'])
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->getRoleNames()->first(),
                ];
            });

        return response()->json($usuarios);
    }

    /**
     * Crea una nueva entrega (solo Producción).
     */
    public function store(Request $request)
    {
        $request->validate([
            'obra_id' => 'required|exists:obras,obra_id',
            'destinatario_id' => 'required|exists:users,id',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'fecha' => 'required|date',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $entrega = Entrega::create([
                'obra_id' => $request->obra_id,
                'creador_id' => $user->id,
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'estado_general' => 'en_curso',
            ]);

            EntregaTransicion::create([
                'entrega_id' => $entrega->entrega_id,
                'remitente_id' => $user->id,
                'destinatario_id' => $request->destinatario_id,
                'estado' => 'no_recibido',
                'fecha' => $request->fecha,
                'es_devolucion' => false,
            ]);

            DB::commit();

            // Notificar al destinatario (nueva entrega entrante)
            event(new EntregaActualizadaEvent(
                targetUserId: $request->destinatario_id,
                entregaId: $entrega->entrega_id,
                tipo: 'nueva',
            ));

            // Notificar al creador (para que su lista se actualice también)
            if ($request->destinatario_id !== $user->id) {
                event(new EntregaActualizadaEvent(
                    targetUserId: $user->id,
                    entregaId: $entrega->entrega_id,
                    tipo: 'nueva',
                ));
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating entrega: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la entrega: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene el detalle de una entrega con su historial de transiciones.
     */
    public function getDetalle($entregaId)
    {
        try {
            $entrega = Entrega::with([
                'obra:obra_id,nombre',
                'creador:id,name',
                'transiciones.remitente:id,name',
                'transiciones.destinatario:id,name',
            ])->findOrFail($entregaId);

            $transiciones = $entrega->transiciones()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($t) {
                    return [
                        'transicion_id' => $t->transicion_id,
                        'estado' => $t->estado,
                        'comentario' => $t->comentario,
                        'fecha' => $t->fecha,
                        'es_devolucion' => $t->es_devolucion,
                        'created_at' => $t->created_at,
                        'remitente' => [
                            'id' => $t->remitente->id,
                            'name' => $t->remitente->name,
                        ],
                        'destinatario' => [
                            'id' => $t->destinatario->id,
                            'name' => $t->destinatario->name,
                        ],
                    ];
                });

            return response()->json([
                'success' => true,
                'entrega' => [
                    'entrega_id' => $entrega->entrega_id,
                    'titulo' => $entrega->titulo,
                    'descripcion' => $entrega->descripcion,
                    'estado_general' => $entrega->estado_general,
                    'created_at' => $entrega->created_at,
                    'obra' => [
                        'obra_id' => $entrega->obra->obra_id,
                        'nombre' => $entrega->obra->nombre,
                    ],
                    'creador' => [
                        'id' => $entrega->creador->id,
                        'name' => $entrega->creador->name,
                    ],
                ],
                'transiciones' => $transiciones,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching entrega detail: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el detalle de la entrega'
            ], 500);
        }
    }

    /**
     * Actualiza el estado de la transición actual.
     */
    public function updateEstado(Request $request, $transicionId)
    {
        $request->validate([
            'estado' => 'required|string|in:no_recibido,recibido,faltante',
        ]);

        try {
            $transicion = EntregaTransicion::findOrFail($transicionId);

            // Solo el destinatario puede cambiar el estado
            if ($transicion->destinatario_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para cambiar el estado de esta entrega.'
                ], 403);
            }

            $transicion->update(['estado' => $request->estado]);

            event(new EntregaActualizadaEvent(
                targetUserId: $transicion->remitente_id,
                entregaId: $transicion->entrega_id,
                tipo: 'estado',
            ));

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado correctamente.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating transicion estado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado.'
            ], 500);
        }
    }

    /**
     * Envía la entrega al siguiente destinatario.
     */
    public function enviar(Request $request, $entregaId)
    {
        $request->validate([
            'destinatario_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $entrega = Entrega::findOrFail($entregaId);
            $transicionActual = $entrega->transiciones()->latest('transicion_id')->first();

            // Verificar que el usuario actual es el destinatario de la transición actual
            if (!$transicionActual || $transicionActual->destinatario_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para enviar esta entrega.'
                ], 403);
            }

            // Verificar que la transición actual está marcada como recibida
            if ($transicionActual->estado !== 'recibido') {
                return response()->json([
                    'success' => false,
                    'message' => 'Debes marcar la entrega como recibida antes de enviarla.'
                ], 422);
            }

            // Crear nueva transición
            EntregaTransicion::create([
                'entrega_id' => $entrega->entrega_id,
                'remitente_id' => $user->id,
                'destinatario_id' => $request->destinatario_id,
                'estado' => 'no_recibido',
                'fecha' => $request->fecha,
                'es_devolucion' => false,
            ]);

            DB::commit();

            // Notificar al nuevo destinatario
            event(new EntregaActualizadaEvent(
                targetUserId: $request->destinatario_id,
                entregaId: $entrega->entrega_id,
                tipo: 'enviada',
            ));

            // Notificar al remitente (su tarjeta cambia de destinatario)
            if ($request->destinatario_id !== $user->id) {
                event(new EntregaActualizadaEvent(
                    targetUserId: $user->id,
                    entregaId: $entrega->entrega_id,
                    tipo: 'enviada',
                ));
            }

            return response()->json([
                'success' => true,
                'message' => 'Entrega enviada correctamente.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error sending entrega: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar la entrega.'
            ], 500);
        }
    }

    /**
     * Devuelve la entrega al remitente (cuando el estado es Faltante).
     */
    public function devolver(Request $request, $entregaId)
    {
        $request->validate([
            'comentario' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $entrega = Entrega::findOrFail($entregaId);
            $transicionActual = $entrega->transiciones()->latest('transicion_id')->first();

            // Verificar que el usuario actual es el destinatario de la transición actual
            if (!$transicionActual || $transicionActual->destinatario_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para devolver esta entrega.'
                ], 403);
            }

            // Verificar que la transición actual está en faltante
            if ($transicionActual->estado !== 'faltante') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes devolver entregas marcadas como faltante.'
                ], 422);
            }

            // Guardar el comentario en la transición actual
            $transicionActual->update(['comentario' => $request->comentario]);

            // Crear nueva transición de devolución al remitente original
            EntregaTransicion::create([
                'entrega_id' => $entrega->entrega_id,
                'remitente_id' => $user->id,
                'destinatario_id' => $transicionActual->remitente_id,
                'estado' => 'no_recibido',
                'fecha' => now()->toDateString(),
                'es_devolucion' => true,
                'comentario' => $request->comentario,
            ]);

            DB::commit();

            event(new EntregaActualizadaEvent(
                targetUserId: $transicionActual->remitente_id,
                entregaId: $entrega->entrega_id,
                tipo: 'devuelta',
            ));

            return response()->json([
                'success' => true,
                'message' => 'Entrega devuelta correctamente.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error returning entrega: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al devolver la entrega.'
            ], 500);
        }
    }

    /**
     * Marca la entrega como completada (Chofer marca como recibido).
     */
    public function completar(Request $request, $entregaId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userRole = $user->getRoleNames()->first();

        DB::beginTransaction();
        try {
            $entrega = Entrega::findOrFail($entregaId);
            $transicionActual = $entrega->transiciones()->latest('transicion_id')->first();

            // Verificar que el usuario actual es el destinatario
            if (!$transicionActual || $transicionActual->destinatario_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para completar esta entrega.'
                ], 403);
            }

            // Verificar que el usuario es Chofer
            if ($userRole !== 'Chofer' && $userRole !== 'Administrador') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo el Chofer puede finalizar una entrega.'
                ], 403);
            }

            // Marcar transición como recibida
            $transicionActual->update(['estado' => 'recibido']);

            // Marcar entrega como completada
            $entrega->update(['estado_general' => 'completado']);

            DB::commit();

            event(new EntregaActualizadaEvent(
                targetUserId: $entrega->creador_id,
                entregaId: $entrega->entrega_id,
                tipo: 'completada',
            ));

            return response()->json([
                'success' => true,
                'message' => 'Entrega completada correctamente.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error completing entrega: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al completar la entrega.'
            ], 500);
        }
    }
}
