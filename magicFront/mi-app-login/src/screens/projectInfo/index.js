import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../style/styles.css';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput"; 
import nuevoProyectoImg1 from "../../images/titulo_nuevo_proyecto_1.png";       
import tituloProyectoImg from "../../images/titulo_nombre.png";     
import integrantesImg from "../../images/titulo_integrantes.png";         
import profesorImg from "../../images/titulo_profesor.png"; 
import momentoDatos from "../../images/momento_datos.png";
import momentoAnios from "../../images/titulo_anio.png";
import axiosClient from '../../utils/axios';

const ProjectInfo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const projectId = location.state?.projectId
  const [proyecto, setProyecto] = useState(null)
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
  ];
  
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
            setIntegrantes(proyectoData.teamMembers ? proyectoData.teamMembers.map(member => ({ cedula: "", nombre: member })) : [{ cedula: "", nombre: "" }])
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
          teamMembers: integrantes.map(integrante => integrante.nombre),
          openingYear: parseInt(ano),
          professor: professors,
        }
  
        let response

        if (projectId) {
          //TODO:
          // Si hay un ID, actualiza el proyecto existente (PUT o PATCH)
          // const response = await axiosClient.put(`/api/v1/project-info/${projectId}`, dataToSend);
          // Suponiendo que el backend requiere todos los datos en PUT, sino usa PATCH
          console.log("Actualizando proyecto existente")
          navigate('/proyeccionMacro', { state: { projectId: projectId, openingYear: ano } })
        } else {
          response = await axiosClient.postProjectInfo('/api/v1/project-info', dataToSend)
          console.log("Creando nuevo proyecto")
        }

        console.log("ProjectInfo guardado con éxito!")
        
        if (response && response.id) {
            console.log(`Response && response.id from projectInfo ${response
              }`)
            navigate('/proyeccionMacro', { state: { projectId: projectId, openingYear: ano } })
        } else if (projectId) {
            navigate('/proyeccionMacro', { state: { projectId: projectId, openingYear: ano } })
        } else {
          console.warn("No se recibió un ID de proyecto al guardar.")
          setError("No se recibió un ID de proyecto al guardar.")
          navigate('../newProject', { state: { projectId: null } })
        }

      } catch (err) {
        console.error("Error al guardar el proyecto:", err)
        setError(err.message || "Error al guardar el proyecto.")
      } finally {
        setLoading(false)
      }
    }
  
    if (loading) {
      return <p>Cargando información del proyecto...</p>;
    }
  
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }  

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container">
        <div className="robot-container">
          <img src={nuevoProyectoImg1} alt="Robot" className="robot-img" />
        </div>
        <div className="contenido-container">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.
          </p>
          <div className="section">
            <img src={tituloProyectoImg} alt="Creación de un nuevo proyecto" className="section-img1" />
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
              volutpat.
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
          <div className="section">
            <img src={profesorImg} alt="Selecciona tu profesor" className="section-img3" />
            <div className="profesor">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
                nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
                volutpat.
              </p>
              {profesoresLista.map((profesor) => (
                <label key={profesor.id} style={{ display: "block", margin: "5px 0" }}>
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
          </div>

          <div className="robot-container">
            <img src={momentoDatos} alt="Momento de los datos" className="robot-img2" /> 
          </div>
          <img src={momentoAnios} alt="Momento" className="section-img4" />
          <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat.
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
            <button className="nav-btn siguiente" onClick={handleSubmit}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProjectInfo;
