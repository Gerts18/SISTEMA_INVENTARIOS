<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EntregaActualizadaEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $targetUserId,
        public int $entregaId,
        public string $tipo, // 'nueva', 'enviada', 'devuelta', 'estado', 'completada'
    ) {}

    /**
     * Canal privado por usuario destinatario.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('entregas.user.' . $this->targetUserId),
        ];
    }

    /**
     * Nombre del evento en el cliente.
     */
    public function broadcastAs(): string
    {
        return 'EntregaActualizada';
    }

    /**
     * Payload enviado al cliente.
     */
    public function broadcastWith(): array
    {
        return [
            'entrega_id' => $this->entregaId,
            'tipo' => $this->tipo,
        ];
    }
}
