/**
 * Utilidad de generación de miniaturas en el navegador mediante HTML5 Canvas
 * Reduce imágenes de hasta 10MB a miniaturas ligeras (~30-60 KB)
 */
export async function createImageThumbnail(
    file: File, 
    maxWidth = 320, 
    maxHeight = 320, 
    quality = 0.7
): Promise<File | null> {
    if (!file.type.startsWith('image/')) {
        return null;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calcular nuevas dimensiones manteniendo la relación de aspecto
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }

                // Dibujar imagen redimensionada con suavizado
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'medium';
                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como JPEG comprimido
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(null);
                            return;
                        }

                        const thumbFileName = `thumb_${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
                        const thumbFile = new File([blob], thumbFileName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });

                        resolve(thumbFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => resolve(null);
            img.src = e.target?.result as string;
        };

        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}
