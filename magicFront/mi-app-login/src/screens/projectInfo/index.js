import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/styles.css';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import nuevoProyectoImg1 from "../../images/titulo_nuevo_proyecto_1.png";       
import tituloProyectoImg from "../../images/titulo_nombre.png";     
import integrantesImg from "../../images/titulo_integrantes.png";         
import profesorImg from "../../images/titulo_profesor.png"; 
import momentoDatos from "../../images/momento_datos.png";
import momentoAnios from "../../images/titulo_anio.png";

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

  const profesoresLista = [
    { id: 1, nombre: "Profesor Mauricio" },
    { id: 2, nombre: "Profesor Antonio" },
    { id: 3, nombre: "Profesor Diana" },
    { id: 4, nombre: "Profesor Cristina" }
  ];
  
    const [seleccionados, setSeleccionados] = useState([]);
  
    const manejarCambio = (id) => {
      setSeleccionados((prevSeleccionados) =>
        prevSeleccionados.includes(id)
          ? prevSeleccionados.filter((profesorId) => profesorId !== id)
          : [...prevSeleccionados, id]
      );
    };

    const [ano, setAno] = useState("2025"); // Año por defecto

    const manejarCambioF = (e) => {
      const valor = e.target.value;
      // Permite solo números y restringe a 4 dígitos
      if (/^\d{0,4}$/.test(valor)) {
        setAno(valor);
      }
    };

    // Para navegar con anterior y siguente
    const navigate = useNavigate();

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
          {/* Sección de Integrantes */}
          <div className="section">
            <img src={integrantesImg} alt="Integrantes" className="section-img2" />  
            <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.</p>
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
                      checked={seleccionados.includes(profesor.id)}
                      onChange={() => manejarCambio(profesor.id)}
                    />
                    {profesor.nombre}
                  </label>
                ))}
                <p>Profesores seleccionados: {seleccionados.join(", ")}</p>
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
            <button className="nav-btn siguiente" onClick={() => navigate("/newProject")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewProject;
