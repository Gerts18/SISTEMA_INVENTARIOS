import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Upload, File, Image, XCircle, AlertTriangle } from 'lucide-react'

interface MultiFileUploadProps {
    onFilesChange: (files: (File | null)[]) => void;
    maxFiles?: number;
    required?: boolean;
    title?: string;
    description?: string;
}

const MultiFileUpload = ({ 
    onFilesChange, 
    maxFiles = 3, 
    required = true,
    title = "Archivos de la obra",
    description = "Selecciona los archivos necesarios para la obra"
}: MultiFileUploadProps) => {
    const [files, setFiles] = useState<(File | null)[]>(Array(maxFiles).fill(null))
    const [previews, setPreviews] = useState<(string | null)[]>(Array(maxFiles).fill(null))
    const [fileSizeErrors, setFileSizeErrors] = useState<(string | null)[]>(Array(maxFiles).fill(null))
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleFileChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        const newFiles = [...files]
        const newPreviews = [...previews]
        const newErrors = [...fileSizeErrors]
        
        if (file) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                newErrors[index] = `El archivo es demasiado grande. Tamaño máximo permitido: 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
                event.target.value = ''
                newFiles[index] = null
                newPreviews[index] = null
            } else {
                newErrors[index] = null
                newFiles[index] = file

                if (file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const newPreviewsWithImage = [...newPreviews]
                        newPreviewsWithImage[index] = e.target?.result as string
                        setPreviews(newPreviewsWithImage)
                    }
                    reader.readAsDataURL(file)
                } else {
                    newPreviews[index] = null
                }
            }
        } else {
            newErrors[index] = null
            newFiles[index] = null
            newPreviews[index] = null
        }

        setFiles(newFiles)
        setPreviews(newPreviews)
        setFileSizeErrors(newErrors)
        onFilesChange(newFiles)
    }

    const handleRemoveFile = (index: number) => {
        const newFiles = [...files]
        const newPreviews = [...previews]
        const newErrors = [...fileSizeErrors]
        
        newFiles[index] = null
        newPreviews[index] = null
        newErrors[index] = null
        
        setFiles(newFiles)
        setPreviews(newPreviews)
        setFileSizeErrors(newErrors)
        onFilesChange(newFiles)

        // Clear the input
        const input = document.getElementById(`file-upload-${index}`) as HTMLInputElement
        if (input) input.value = ''
    }

    const getUploadedFilesCount = () => {
        return files.filter(file => file !== null).length
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {title} {required && <span className="text-red-500">*</span>}
                </CardTitle>
                <CardDescription>
                    {description}. Debe subir al menos 1 archivo, máximo {maxFiles}.
                </CardDescription>
                <div className="text-sm text-muted-foreground">
                    Archivos subidos: {getUploadedFilesCount()}/{maxFiles}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: maxFiles }, (_, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={`file-upload-${index}`} className="text-sm font-medium">
                                    Archivo {index + 1}
                                    {index === 0 && required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                {files[index] && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-red-500 hover:text-red-700 h-auto p-1"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <Input
                                id={`file-upload-${index}`}
                                type="file"
                                onChange={handleFileChange(index)}
                                accept="image/*,.pdf,.doc,.docx"
                                className="cursor-pointer"
                            />

                            {fileSizeErrors[index] && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        {fileSizeErrors[index]}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {files[index] && !fileSizeErrors[index] && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                        <div className="flex items-center gap-2 text-sm">
                                            {files[index]?.type?.startsWith('image/') ? (
                                                <Image className="h-4 w-4" />
                                            ) : (
                                                <File className="h-4 w-4" />
                                            )}
                                            <span className="truncate max-w-[200px]">{files[index]?.name}</span>
                                            <span className="text-muted-foreground">
                                                ({(files[index]!.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                    </div>

                                    {previews[index] && (
                                        <div className="border rounded-md p-2 bg-muted/30">
                                            <img 
                                                src={previews[index]!} 
                                                alt={`Preview ${index + 1}`} 
                                                className="max-w-full h-32 object-contain mx-auto rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Formatos permitidos: Imágenes (PNG, JPG, GIF), PDF, DOC, DOCX
                        </div>
                        <div>Tamaño máximo por archivo: 10MB</div>
                    </div>

                    {required && getUploadedFilesCount() === 0 && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                Debe subir al menos un archivo para continuar.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default MultiFileUpload
