import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, Image, XCircle, AlertTriangle } from 'lucide-react'

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

const FileUpload = ({ onFileSelect, selectedFile }: FileUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null)
    const [fileSizeError, setFileSizeError] = useState<string | null>(null)
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        
        if (file) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setFileSizeError(`El archivo es demasiado grande. Tamaño máximo permitido: 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
                // Clear the input
                event.target.value = ''
                onFileSelect(null)
                setPreview(null)
                return
            }
            
            setFileSizeError(null)
            onFileSelect(file)

            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setPreview(e.target?.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                setPreview(null)
            }
        } else {
            setFileSizeError(null)
            onFileSelect(null)
            setPreview(null)
        }
    }

    const handleRemoveFile = () => {
        onFileSelect(null)
        setPreview(null)
        setFileSizeError(null)
    }

    const isImage = selectedFile?.type?.startsWith('image/')

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Comprobante (Obligatorio)
                </CardTitle>
                <CardDescription>
                    Selecciona un archivo como comprobante de la gestión
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">
                            Archivo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,.pdf,.doc,.docx"
                            className="cursor-pointer"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Formatos permitidos: Imágenes, PDF, DOC, DOCX. Tamaño máximo: 10MB
                        </p>
                    </div>

                    {fileSizeError && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {fileSizeError}
                            </AlertDescription>
                        </Alert>
                    )}

                    {selectedFile && !fileSizeError && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2 text-sm">
                                    {isImage ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />}
                                    <span>{selectedFile.name}</span>
                                    <span className="text-muted-foreground">
                                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>

                            {preview && (
                                <div className="border rounded-md p-2">
                                    <img 
                                        src={preview} 
                                        alt="Preview" 
                                        className="max-w-full h-32 object-contain mx-auto"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default FileUpload