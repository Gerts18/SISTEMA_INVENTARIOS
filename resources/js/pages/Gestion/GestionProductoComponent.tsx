import ConsultaExistencia from "./ConsultaExistencia"


const GestionComponent = ({ tipo='Entrada'  }: any) => {
    return (
        <section className="mx-auto p-6 space-y-6 border-4 rounded-2xl min-h-screen my-6">

            <h1 className="text-2xl font-bold text-green-700 mb-6">{`${tipo} de Productos`} </h1>

            <ConsultaExistencia/>

            
        </section>
    )
}

export default GestionComponent