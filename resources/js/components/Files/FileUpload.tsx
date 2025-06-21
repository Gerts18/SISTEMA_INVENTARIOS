import { useState } from "react";
// Para S3 en el navegador:

const FileUpload = () => {

    const [file, setFile] = useState<any>(null)
    const [uploadedFile, setUploadedFile] = useState(null)

    const handleFileChange = (event:any) => {
        console.log(event.target.files[0])
        setFile(event.target.files[0])

    }

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first")
            return
        }

        const params = {
            Key : file.name,
            Body: file,
        }

    }

    return (
        <div>
            {uploadedFile && (<img src={uploadedFile} alt="Uploaded" className="w-32 h-32 object-cover" />)}
            <br />
            <input
                type="file"
                onChange={handleFileChange}
                className="background-white border border-gray-300 rounded-md p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button onClick={handleUpload}>Click me</button>
        </div>
    )
}

export default FileUpload