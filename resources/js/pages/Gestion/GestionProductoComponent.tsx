import ConsultaExistencia from "./ConsultaExistencia"


const GestionComponent = ({ producto, flash }: any) => {
    return (
        <section className="mx-auto p-6 space-y-6 border-4 rounded-2xl min-h-screen my-6">

            <h1 className="text-2xl font-bold text-green-700 mb-6">ENTRADA DE PRODUCTOS</h1>

            <ConsultaExistencia producto={producto} flash={flash} />

        </section>
    )
}

export default GestionComponent