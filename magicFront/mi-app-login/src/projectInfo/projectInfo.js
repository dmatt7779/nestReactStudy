import React, { useState } from "react";
import '../styles.css';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import profe1 from '../images/profe1.jpg';
import profe2 from '../images/profe2.jpg';
import profe3 from '../images/profe3.jpg';
import profe4 from '../images/profe4.jpg';
import profe5 from '../images/profe5.jpg';
import profe6 from '../images/profe6.jpg';

function ProjectInfo() {
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [integrantes, setIntegrantes] = useState([{ cedula: "", nombre: "" }]); // Array para los integrantes
  const [anoApertura, setAnoApertura] = useState("");
  const [proyeccionMacro, setProyeccionMacro] = useState({
    ipc: [0, 0, 0, 0, 0],
    devaluacion: [0, 0, 0, 0, 0],
    tasaInteres: [0, 0, 0, 0, 0],
    pib: [0, 0, 0, 0, 0],
  });

  const agregarIntegrante = () => {
    setIntegrantes([...integrantes, { cedula: "", nombre: "" }]);
  };

  const manejarCambioIntegrante = (indice, valor) => {
    const nuevosIntegrantes = [...integrantes];
    nuevosIntegrantes[indice] = valor;
    setIntegrantes(nuevosIntegrantes);
  };

  const handleInputChange = (campo, indice, valor) => {
    setProyeccionMacro((prevState) => ({
      ...prevState,
      [campo]: [...prevState[campo].slice(0, indice), valor, ...prevState[campo].slice(indice + 1)],
    }));
  };

  const [estrategiaUnidades, setEstrategiaUnidades] = useState(false);
  const [crecimientoCantidadesUnidades, setCrecimientoCantidadesUnidades] = useState([0, 0, 0, 0, 0]);
  const [estrategiaPrecios, setEstrategiaPrecios] = useState(false);
  const [crecimientoCantidadesPrecios, setCrecimientoCantidadesPrecios] = useState([0, 0, 0, 0, 0]);

  const handleInputChangeCantidad = (indice, valor, tipo) => {
        if (tipo === 'unidades') {
        setCrecimientoCantidadesUnidades((prevState) => ([...prevState.slice(0, indice), valor, ...prevState.slice(indice + 1)]));
        } else if (tipo === 'precios') {
        setCrecimientoCantidadesPrecios((prevState) => ([...prevState.slice(0, indice), valor, ...prevState.slice(indice + 1)]));
        }
    }

  const handleSubmit = (event) => {
    event.preventDefault();
    // Crear Json en Node o PHP para mandarlo a SQL y Python
    console.log("Nombre del Proyecto:", nombreProyecto);
    console.log("Integrantes:", integrantes);
    console.log("Año de Apertura:", anoApertura);
    console.log("Proyección Macro:", proyeccionMacro);
  };

  // Seleccionar profesor
  const profesores = [
    { id: 1, nombre: 'Profesor 1', foto: profe1 },
    { id: 2, nombre: 'Profesor 2', foto: profe2 },
    { id: 3, nombre: 'Profesor 3', foto: profe3 },
    { id: 4, nombre: 'Profesor 4', foto: profe4 },
    { id: 5, nombre: 'Profesor 5', foto: profe5 },
    { id: 6, nombre: 'Profesor 6', foto: profe6 },
  ];

  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const handleProfesorSelect = (profesor) => {
    setSelectedProfesor(profesor);
  };

  return (
    <div className="container-pi ">
      <Navbar />
      <div className="right-panel-pi">
      <form onSubmit={handleSubmit}>
      <div className="title-imagen-pi"></div>
      <h2>Nuevo Proyecto</h2>
        <div>
          <label htmlFor="nombreProyecto">Nombre del Proyecto:</label>
          <input
            type="text"
            id="nombreProyecto"
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
            required
          />
        </div>
        <div className="profesor">
          <h2>1. Integrantes:</h2>
          <p>Diligencie en los siguientes recuadros los estudiantes que conforman el grupo.</p>
          {integrantes.map((integrante, indice) => (
            <div key={indice} className="integrante-fields"> {/* Agrega una clase */}
              <label htmlFor={`cedula-${indice}`}>Cédula:</label>
              <input
                type="text"
                id={`cedula-${indice}`}
                value={integrante.cedula}
                onChange={(e) => manejarCambioIntegrante(indice, "cedula", e.target.value)}
                required
              />
              <label htmlFor={`nombre-${indice}`}>Nombre:</label>
              <input
                type="text"
                id={`nombre-${indice}`}
                value={integrante.nombre}
                onChange={(e) => manejarCambioIntegrante(indice, "nombre", e.target.value)}
                required
              />
            </div>
          ))}
          <div className="add-int">
            <button type="button" onClick={agregarIntegrante}>
              +
            </button>
          </div>
          <div>
            <h3>Selecciona tu profesor:</h3>
            <div className="profesor-grid">
            {profesores.map((profesor) => (
          <div
            key={profesor.id} // Usa el ID como key
            className={`profesor-card ${selectedProfesor?.id === profesor.id ? 'selected' : ''}`} // Compara por ID
            onClick={() => handleProfesorSelect(profesor)}
        >
                  <img src={profesor.foto} alt={profesor.nombre} />
                  <p>{profesor.nombre}</p>
          </div>
              ))}
            </div>
          </div>
          <h2>2. Años de proyección</h2>
          <p>Ingrese el primer año o año base para las proyecciones financieras (por ejemplo 2020).</p>
          <h2><label htmlFor="anoApertura">Año de Apertura:</label></h2>
          <input
            type="number"
            id="anoApertura"
            value={anoApertura}
            onChange={(e) => setAnoApertura(e.target.value)}
            required
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
      <Footer />
      </div>
      <div className="left-panel-pi"></div>
    </div>
  );
}
export default ProjectInfo;