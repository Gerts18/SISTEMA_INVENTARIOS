import axios from 'axios';

/**
 * Registra de forma asíncrona y silenciosa la consulta o descarga de un archivo
 */
export async function trackFileClick(
    type: 'archivo_obra' | 'gestion' | 'solicitud', 
    id: number
): Promise<void> {
    if (!id) return;

    try {
        await axios.post('/telemetry/track-click', {
            type,
            id,
        });
    } catch (error) {
        // Fallo silencioso para no degradar la experiencia de usuario
        console.warn('Telemetry track error:', error);
    }
}
