import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import '../../style/styles.css';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import robotImg from '../../images/robot2.png';
import nuevoProyectoImg from "../../images/bt_nuevo_proyecto.png";
import tituloProyectoImg from "../../images/titulo_nuevo_proyecto.png";
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";

const NewProject = () => {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { isProcessing, runWithLoader } = useProcessing()
  const NUM_CARDS = 5

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axiosClient.get('/api/v1/project-info')
        console.log(`newPorject all ${JSON.stringify(response, null, 2)}`)
        if (response && Array.isArray(response)) {
          const proyectosOrdenados = response.sort((a, b) => a.id - b.id)
          setProyectos(proyectosOrdenados)
        } else {
          setProyectos([])
        }

      } catch (err) {
        console.error("Error al obtener los proyectos:", err)
        // Toast notifications are handled automatically by axios utils
      } finally {
        setLoading(false)
      }
    }

    fetchProyectos()
  }, [navigate])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="nuevo-proyecto-container">
          <p>Cargando proyectos...</p>
        </div>
        <Footer />
      </div>
    )
  }



  return (
    <div>
      {isProcessing && <CeipaLoader />}
      <Navbar />    
    <div className="nuevo-proyecto-container">      
      <div className="robot-container">
         <img src={robotImg} alt="Robot" className="robot-img" />
      </div>
      <div className="contenido-container">
        <div>
          <img 
            src={tituloProyectoImg} 
            alt="Creación de un nuevo proyecto" 
            className="img-resizable"
          />
        </div>
        <p></p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid-proyectos">
            {Array.from({ length: NUM_CARDS }).map((_, index) => {
              const project = proyectos[index]
              const projectId = project ? project.id : null
              const projectName = project ? project.projectName : ""
              // Ajuste dinámico de fuente según qué tan largo sea el texto
              const nameLength = projectName.length;
              let dynamicFontSize = "15px";
              let dynamicLineHeight = "1.2";
              
              if (nameLength > 24) {
                dynamicFontSize = "11px";
                dynamicLineHeight = "1.1";
              } else if (nameLength > 14) {
                dynamicFontSize = "13px";
                dynamicLineHeight = "1.15";
              }

              return (
                <div
                  key={index}
                  className="proyecto-card"
                  onClick={async () => {
                    if (projectId) {
                      sessionStorage.setItem("currentProjectId", projectId);
                    } else {
                      sessionStorage.removeItem("currentProjectId");
                    }
                    let navTarget = { path: '/projectInfo', state: { projectId } };
                    await runWithLoader(async () => {});
                    navigate(navTarget.path, { state: navTarget.state });
                  }}
                >
                  {project ? (
                    <div className="proyecto-card-activo">
                      <div className="card-top-activa">
                        <p 
                          className="card-titulo-activo" 
                          style={{ fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }}
                        >
                          {projectName}
                        </p>
                      </div>
                      <div className="card-bottom-activa" onClick={async (e) => {
                          e.stopPropagation();
                          const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${projectName}" y todos sus datos relacionados? Esta acción no se puede deshacer.`);
                          if (confirmDelete) {
                            try {
                              await runWithLoader(async () => {
                                await axiosClient.deleteProject(`/api/v1/project-info/${projectId}`);
                                setProyectos(prev => prev.filter(p => p.id !== projectId));
                                if (sessionStorage.getItem("currentProjectId") === String(projectId)) {
                                  sessionStorage.removeItem("currentProjectId");
                                }
                              });
                            } catch (error) {
                              console.error("Error al eliminar el proyecto:", error);
                              // toast notifications are handled by the axios error interceptor
                            }
                          }
                      }}>
                        <Trash2 size={16} />
                        <span>Eliminar proyecto</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="imagen-hover">
                        <img src={nuevoProyectoImg} alt="Nuevo Proyecto" className="proyecto-img" />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </form>
      </div>
      <Footer />
    </div>
    </div>
  );
};

export default NewProject;