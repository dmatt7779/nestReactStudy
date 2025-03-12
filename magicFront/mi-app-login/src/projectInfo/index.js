import React, { useState } from "react";
import '../style/styles.css';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import robotImg from '../images/robot2.png';
import nuevoProyectoImg1 from "../images/titulo_nuevo_proyecto_1.png";       // Imagen principal del título
import tituloProyectoImg from "../images/titulo_nombre.png";     // Imagen para "Título proyecto nuevo"
import integrantesImg from "../images/titulo_integrantes.png";            // Imagen para "Integrantes"
import profesorImg from "../images/titulo_profesor.png";  
const NewProject = () => {
  // Estado para la lista de integrantes
  const [integrantes, setIntegrantes] = useState([
    { cedula: "", nombre: "" }
  ]);

  // Función para agregar un nuevo integrante
  const addIntegrante = () => {
    setIntegrantes([...integrantes, { cedula: "", nombre: "" }]);
  };

  // Función para actualizar el valor de un integrante
  const handleIntegranteChange = (index, field, value) => {
    const nuevosIntegrantes = [...integrantes];
    nuevosIntegrantes[index][field] = value;
    setIntegrantes(nuevosIntegrantes);
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="robot-container">
        <img src={nuevoProyectoImg1} alt="Robot" className="robot-img" />
      </div>
      <div className="contenido-container">
        <div className="titulo-imagen">
          <img
            src={tituloProyectoImg}
            alt="Creación de un nuevo proyecto"
            className="project-title-img"
          />
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat.
        </p>
        {/* Sección de Integrantes */}
        <div className="section">
          <img
            src={integrantesImg}
            alt="Integrantes"
            className="section-img"
          />
          <p className="section-description">Integrantes del proyecto:</p>
          <div className="integrantes-container">
            {integrantes.map((integrante, index) => (
              <div key={index} className="integrante-fields">
                <label htmlFor={`cedula-${index}`}>Cédula:</label>
                <input
                  type="text"
                  placeholder="Ingresa cédula"
                  value={integrante.cedula}
                  onChange={(e) =>
                    handleIntegranteChange(index, "cedula", e.target.value)
                  }
                />
                <label htmlFor={`nombre-${index}`}>Nombre:</label>
                <input
                  type="text"
                  placeholder="Ingresa nombre"
                  value={integrante.nombre}
                  onChange={(e) =>
                    handleIntegranteChange(index, "nombre", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <button className="add-integrant-btn" onClick={addIntegrante}>
            + Agregar integrantes
          </button>
        </div>
        {/* Sección de Seleccionar Profesor */}
        <div className="section">
          <img
            src={profesorImg}
            alt="Selecciona tu profesor"
            className="section-img"
          />
          <p className="section-description">Selecciona tu profesor:</p>
          <select className="professor-select">
            <option>Profesor 1</option>
            <option>Profesor 2</option>
            <option>Profesor 3</option>
          </select>
        </div>
        {/* Botones de navegación */}
        <div className="buttons-container">
          <button className="nav-btn">Anterior</button>
          <button className="nav-btn">Siguiente</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewProject;
