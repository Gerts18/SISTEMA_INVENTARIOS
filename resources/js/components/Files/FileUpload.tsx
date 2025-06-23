import { useState } from "react";

import { useForm } from '@inertiajs/react'

const FileUpload = () => {

    const [file, setFile] = useState<any>(null)

    const { data, setData, post, progress } = useForm({
        comprobante: null
    })

    function submit(e: any) {
        e.preventDefault()
        post('/gestion/subir-comprobante', {
            forceFormData: true
        })
    }

    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files[0]
        setFile(selectedFile)
        console.log('Selected file:', selectedFile)
        setData('comprobante', selectedFile)
    }

    return (
        
        <div>
            <form onSubmit={submit} encType="multipart/form-data">
                <input type="file" onChange={handleFileChange} />
                {progress && (
                    <progress value={progress.percentage} max="100">
                        {progress.percentage}%
                    </progress>
                )}
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default FileUpload