import React, { useState, useEffect } from "react";
import '../../style/styles.css';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import robotImg from '../../images/robot2.png';
import nuevoProyectoImg from "../../images/bt_nuevo_proyecto.png";
import tituloProyectoImg from "../../images/titulo_nuevo_proyecto.png";
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';

const NewProject = () => {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const NUM_CARDS = 5

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axiosClient.get('/api/v1/project-info')
        if (response && Array.isArray(response)) {
          const proyectosOrdenados = response.sort((a, b) => a.id - b.id)
          setProyectos(proyectosOrdenados)
        } else {
          setProyectos([])
        }

      } catch (err) {
        console.error("Error al obtener los proyectos:", err)
        setError(err.message || "Error al obtener los proyectos. Por favor, inténtalo de nuevo.")
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

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="nuevo-proyecto-container">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }  

  return (
    <div><Navbar />    
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
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid-proyectos">
            {Array.from({ length: NUM_CARDS }).map((_, index) => {
              const proyecto = proyectos[index]
              const proyectoId = proyecto ? proyecto.id : null

              return (
                <div
                  key={index}
                  className="proyecto-card"
                  onClick={() => {
                    navigate('/projectInfo', { state: { proyectoId } })
                  }}
                >
                  <div className="imagen-hover">
                    <img src={nuevoProyectoImg} alt="Nuevo Proyecto" className="proyecto-img" />
                  </div>
                  {proyecto ? (
                    <>
                      <p>{proyecto.projectName}</p>
                      <p>ID: {proyecto.id}</p>
                    </>
                    ) : (
                      <p>Nuevo Proyecto</p>
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