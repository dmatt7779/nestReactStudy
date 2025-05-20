import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteSalarios from "../../images/cabezote_salario_admins.png";

const SalarioAdmins = () => {
  const navigate = useNavigate();

  // Estados para Cargos
  const [cargos, setCargos] = useState([
    { id: Date.now(), concepto: "", valorMes: "" },
  ]);

  const agregarCargo = () => {
    if (cargos.length < 10) {
      setCargos([
        ...cargos,
        { id: Date.now(), concepto: "", valorMes: "" },
      ]);
    }
  };

  const eliminarCargos = (id) => {
    if (window.confirm("¿Está seguro de eliminar este cargo?")) {
      setCargos(cargos.filter((cargo) => cargo.id !== id));
    }
  };

  const manejarCambioCargo = (id, campo, valor) => {
    setCargos((prev) =>
      prev.map((cargo) =>
        cargo.id === id ? { ...cargo, [campo]: valor } : cargo
      )
    );
  };

  
  // Incremento en salarios e inactiva 2025...
  const [opcionSeleccionadaSalarios, setOpcionSeleccionadaSalarios] = useState("");
  const [incrementoSalarios, setIncrementoSalarios] = useState({
    2025: "",
    2026: "",
    2027: "",
    2028: "",
    2029: "",
  });

  const manejarCambioSalarios = (e) => {
    setOpcionSeleccionadaSalarios(e.target.value);
  };

  const manejarCambioCrecSalarios = (anio, valor) => {
    setIncrementoSalarios((prev) => ({ ...prev, [anio]: valor }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezoteSalarios} alt="Robot" className="robot-img-an" />
        </div>
        <div className="contenido-container">
          <p>
            Una vez determinadas las necesidades de personal, la estructura organizacional y las características de la misma, se requiere
            tener el detalle de los empleados con su asignación salarial y carga social y prestacional, la cual corre por parte de los dueños del proyecto
            Ingrese el concepto de empleados que no sean costos y, el valor mensual incluyendo factor prestacional.  Si son varios empleados con el mismo
            cargo, ingrese el total mensual de los mismos, identificando la cantidad de empleados en la descripción
            En este punto no incluya los cargos que tengan que ver con los costos fijos (estos van en la sección de Costos Fijos)
          </p>

          <form onSubmit={handleSubmit}>
            {/* Cargos */}
            <div className="proyeccion-container">
              <h3>Cargos y valor mensual</h3>
              <p>Recuerde incluir prestaciones y auxilio de transporte; salario y/o bonificación de los dueños.</p>
              <table className="tabla-estrategias">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="estrategia-celda-nombre">Cargo</th>
                    <th>Valor mensual</th>
                    <th>Carga prestacional</th>
                  </tr>
                </thead>
                <tbody>
                  {cargos.map((cargo, index) => (
                    <tr key={cargo.id}>
                      <td>{index + 1}</td>
                      <td className="estrategia-celda-nombre">
                        <CustomInput
                          id={`concepto-cargo-${cargo.id}`}
                          value={cargo.concepto}
                          onChange={(value) =>
                            manejarCambioCargo(cargo.id, "concepto", value)
                          }
                          type="text"
                          placeholder="Ej: Analista"
                        />
                      </td>
                      <td>
                        <CustomInput
                          id={`valor-cargo-${cargo.id}`}
                          value={cargo.valorMes}
                          onChange={(value) =>
                            manejarCambioCargo(cargo.id, "valorMes", value)
                          }
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <CustomInput
                          id={`valor-prest-${cargo.id}`}
                          value={cargo.prest}
                          onChange={(value) =>
                            manejarCambioCargo(cargo.id, "valorPrest", value)
                          }
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <button
                          className="estrategia-boton-eliminar"
                          onClick={() => eliminarCargos(cargo.id)}
                          disabled={cargos.length === 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cargos.length < 10 && (
                <button
                  className="estrategia-boton-agregar"
                  onClick={agregarCargo}
                  disabled={cargos.length >= 10}
                >
                  + Agregar Nuevo Cargo
                </button>
              )}
            </div>

            <p>
            El incremento en SALARIOS cada año puede estar fundamentado en la inflación o en otro porcentaje.
            Marque cual sería.

            </p>

            <div id="crecimiento-salario" className="contenedor-crecimiento">
              <CustomInput
                id="opciones-incremento-salarios"
                type="radio"
                value={opcionSeleccionadaSalarios}
                onChange={manejarCambioSalarios}
                options={["IPC", "Otro Porcentaje"]}
                name="metodoIncrementoSalarios"
              />
            </div>

            {opcionSeleccionadaSalarios === "Otro Porcentaje" && (
              <div id="incremento-salarios">
                <p className="texto-estrategia">
                En caso de ser otro porcentaje, ingrese manualmente el mismo por cada año.
                </p>
                <h3>Incremento en Salarios</h3>
                <div className="fila-crecimiento">
                  {Object.keys(incrementoSalarios).map((anio) => (
                    <div key={anio} className="contenedor-input">
                      <span className="anio">Año {anio}</span>
                      <CustomInput
                        id={`incremento-salarios-${anio}`}
                        type="percentage"
                        value={incrementoSalarios[anio]}
                        onChange={(value) => manejarCambioCrecSalarios(anio, value)}
                        disabled={anio === "2025"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/planFinanciero")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SalarioAdmins;
