import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import '../../style/styles.css'
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import CustomInput from "../../components/CustomInput" 
import nuevoProyectoImg1 from "../../images/titulo_nuevo_proyecto_1.png"       
import tituloProyectoImg from "../../images/titulo_nombre.png"     
import integrantesImg from "../../images/titulo_integrantes.png"         
import profesorImg from "../../images/titulo_profesor.png" 
import momentoDatos from "../../images/momento_datos.png"
import momentoAnios from "../../images/titulo_anio.png"
import axiosClient from '../../utils/axios'

const ProjectInfo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const projectId = location.state?.projectId
  const [_, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projectName, setProjectName] = useState("")
  const [integrantes, setIntegrantes] = useState([{ cedula: "", nombre: "" }])
  const [professors, setProfessors] = useState([])
  const [ano, setAno] = useState("2025")

  const profesoresLista = [
    { id: 1, nombre: "Profesor Mauricio" },
    { id: 2, nombre: "Profesor Antonio" },
    { id: 3, nombre: "Profesor Diana" },
    { id: 4, nombre: "Profesor Cristina" }
  ]

  const [formularioCompleto, setFormularioCompleto] = useState(false)

  useEffect(() => {
    const nombreValido = projectName.trim() !== ""
    const integrantesValidos = integrantes.every(
      (i) => i.cedula.trim() !== "" && i.nombre.trim() !== ""
    )
    const profesoresValidos = professors.length > 0
    const anoValido = /^\d{4}$/.test(ano)
  
    setFormularioCompleto(
      nombreValido && integrantesValidos && profesoresValidos && anoValido
    )
  }, [projectName, integrantes, professors, ano])
  
  useEffect(() => {
    const fetchProyecto = async () => {
      setLoading(true)
      setError(null)
      try {
        if (projectId) {
          const response = await axiosClient.get(`/api/v1/project-info/${projectId}`)
          console.log(`ProjectInfo ${JSON.stringify(response, null, 2)}`)
          if (response) {
            const proyectoData = response
            setProyecto(proyectoData)
            setProjectName(proyectoData.projectName || "")
            setIntegrantes(
              proyectoData.teamMembers
                ? proyectoData.teamMembers.map((member) => ({ cedula: member.id || "", nombre: member.name || "" }))
                : [{ cedula: "", nombre: "" }]
            )
            setProfessors(proyectoData.professor || [])
            setAno(proyectoData.openingYear ? proyectoData.openingYear.toString() : "2025")
          } else {
            setError("Proyecto no encontrado.")
          }
        } else {
          setProyecto({})
        }
      } catch (err) {
        console.error("Error al obtener el proyecto:", err)
        setError(err.message || "Error al obtener el proyecto.")
      } finally {
        setLoading(false)
      }
    }
    fetchProyecto()
  }, [projectId])

    const handleProjectNameChange = (e) => {
      setProjectName(e.target.value)
    }
  
    const addIntegrante = () => {
      setIntegrantes([...integrantes, { cedula: "", nombre: "" }])
    }
  
    const handleIntegranteChange = (index, field, value) => {
      const nuevosIntegrantes = [...integrantes]
      nuevosIntegrantes[index][field] = value
      setIntegrantes(nuevosIntegrantes)
    }
  
    const manejarCambio = (id) => {
      setProfessors((prevSeleccionados) =>
        prevSeleccionados.includes(id)
          ? prevSeleccionados.filter((profesorId) => profesorId !== id)
          : [...prevSeleccionados, id]
      )
    }
  
    const manejarCambioF = (e) => {
      const valor = e.target.value
      if (/^\d{0,4}$/.test(valor)) {
        setAno(valor)
      }
    }

  const handleSubmit = async () => {
      setLoading(true)
      setError(null)
      try {
          const dataToSend = {
              projectName: projectName,
              teamMembers: integrantes.map(integrante => ({ id: integrante.cedula, name: integrante.nombre })),
              openingYear: parseInt(ano),
              professor: professors,
          }

          if (projectId) {
              console.log("ProjectInfo - Actualizando proyecto existente con ID:", projectId)
              // await axiosClient.put(`/api/v1/project-info/${projectId}`, dataToSend) // Asumiendo un endpoint PUT/PATCH
              navigate('/proyeccionMacro', { state: { projectId: projectId, openingYear: ano } })
          }else {
            console.log("ProjectInfo - Creando nuevo proyecto...")
            const response = await axiosClient.postProjectInfo('/api/v1/project-info', dataToSend)
            if (response && response.id) {
                console.log("ProjectInfo - Proyecto creado con éxito. Nuevo ID:", response.id)
                navigate('/proyeccionMacro', { state: { projectId: response.id, openingYear: ano } })
            } else {
                console.error("Error: El backend no devolvió un ID para el nuevo proyecto.")
                setError("No se pudo obtener un ID para el nuevo proyecto. Intente de nuevo.")
            }
          }
        } catch (err) {
            console.error("Error al guardar el proyecto:", err)
            setError(err.message || "Error al guardar el proyecto.")
        } finally {
            setLoading(false)
        }
    }
  
    if (loading) {
      return <p>Cargando información del proyecto...</p>
    }
  
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>
    }  

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container">
        <div className="robot-container">
          <img src={nuevoProyectoImg1} alt="Robot" className="robot-img" />
        </div>
        <div className="contenido-container">        
          <h4>¿Estas preparado para iniciar?</h4>
          <p>A continuación, te invito a diligenciar los datos preliminares. Por favor, asegúrate de que la información ingresada cumpla con los criterios de selección y calidad establecidos, esta información será de suma importancia para que este inicio de proyecto tenga todo lo que necesitas para que tu aprendizaje sea exitoso.
          </p>
          <div className="section">
            <img src={tituloProyectoImg} alt="Creación de un nuevo proyecto" className="section-img1" />
          </div>
          <p>
            Ingresar el nombre del proyecto o la empresa que desea valorar.
          </p>

          {/* Campo para el nombre del proyecto */}
          <div className="section">
            <label htmlFor="projectName">Nombre del Proyecto:</label>
            <input
              type="text"
              id="projectName"
              placeholder="Ingresa el nombre del proyecto"
              value={projectName}
              onChange={handleProjectNameChange}
            />
          </div>

          {/* Sección de Integrantes */}
          <div className="section">
            <img src={integrantesImg} alt="Integrantes" className="section-img2" />
            <p>
              Ingrese número de cédula y nombre de la(s) persona(s) que integran el equipo de valoración.
            </p>
            <div className="integrantes-container">
              {integrantes.map((integrante, index) => (
                <div key={index} className="integrante-fields">
                  
                  {/* Campo Cédula */}
                  <div className="integrante-field">
                    <label htmlFor={`cedula-${index}`}>Cédula:</label>
                    <CustomInput
                      id={`cedula-${index}`}
                      type="number"
                      placeholder="Ingresa cédula"
                      value={integrante.cedula}
                      onChange={(value) => handleIntegranteChange(index, "cedula", value)}
                      className="cedula-input"
                    />
                  </div>

                  {/* Campo Nombre */}
                  <div className="integrante-field">
                    <label htmlFor={`nombre-${index}`}>Nombre:</label>
                    <CustomInput
                      id={`nombre-${index}`}
                      type="text"
                      placeholder="Ingresa nombre"
                      value={integrante.nombre}
                      onChange={(value) => handleIntegranteChange(index, "nombre", value)}
                      className="nombre-input"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="add-integrant-btn" onClick={addIntegrante}>
              + Agregar integrantes
            </button>
          </div>

          {/* Sección de Seleccionar Profesor */}
          <div className="profesor-lista">
            <img src={profesorImg} alt="Selecciona tu profesor" className="section-img3" />
              <p>
                Acá, debes seleccionar el profesor que te estará acompañando en tu valoración.
              </p>
              {profesoresLista.map((profesor) => (
                <label key={profesor.id}
                className="profesor-item">
                  <input
                    type="checkbox"
                    value={profesor.id}
                    checked={professors.includes(profesor.id)}
                    onChange={() => manejarCambio(profesor.id)}
                  />
                  {profesor.nombre}
                </label>
              ))}
              <p>Profesores seleccionados: {professors.join(", ")}</p>
          </div>

          <div className="robot-container">
            <img src={momentoDatos} alt="Momento de los datos" className="robot-img2" /> 
          </div>
          <img src={momentoAnios} alt="Momento" className="section-img4" />
          <p>
          Digite el año base o año “cero”
          </p>

          <div className="año-container">
            <label htmlFor="year-input">Año de apertura:</label>
            <input
              type="number"
              value={ano}
              onChange={manejarCambioF}
              placeholder="YYYY"
              min="1900"
              max="2099"
            />
          </div>

          {/* Botones de navegación */}
          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button
              className="nav-btn siguiente"
              onClick={handleSubmit}
              disabled={!formularioCompleto}
              style={{
                opacity: formularioCompleto ? 1 : 0.5,
                cursor: formularioCompleto ? 'pointer' : 'not-allowed'
              }}
            ></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProjectInfo
