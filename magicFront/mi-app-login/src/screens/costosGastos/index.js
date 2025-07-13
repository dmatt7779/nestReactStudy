import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import cabezoteEgresos from "../../images/cabezote_egresos.png";
import tituloEgresos from "../../images/titulo_egresos.png";

const CostosGastos = () => {
  const navigate = useNavigate();

  // Estados para Costos fijos
  const [costos, setCostos] = useState([
    { id: Date.now(), concepto: "", valorMes: "" },
  ]);

  const agregarCosto = () => {
    if (costos.length < 10) {
      setCostos([
        ...costos,
        { id: Date.now(), concepto: "", valorMes: "" },
      ]);
    }
  };

  const eliminarCosto = (id) => {
    if (window.confirm("¿Está seguro de eliminar este costo?")) {
      setCostos(costos.filter((costo) => costo.id !== id));
    }
  };

  const manejarCambioCosto = (id, campo, valor) => {
    setCostos((prev) =>
      prev.map((costo) =>
        costo.id === id ? { ...costo, [campo]: valor } : costo
      )
    );
  };

  // Estados para Gastos administrativos
  const [gastosConst, setGastosConst] = useState(" $ 0 ");
  const [gastos, setGastos] = useState([
    { id: Date.now(), concepto: "", valorMes: "" },
  ]);

  const agregarGasto = () => {
    if (gastos.length < 10) {
      setGastos([
        ...gastos,
        { id: Date.now(), concepto: "", valorMes: "" },
      ]);
    }
  };

  const eliminarGasto = (id) => {
    if (window.confirm("¿Está seguro de eliminar este gasto?")) {
      setGastos(gastos.filter((gasto) => gasto.id !== id));
    }
  };

  const manejarCambioGasto = (id, campo, valor) => {
    setGastos((prev) =>
      prev.map((gasto) =>
        gasto.id === id ? { ...gasto, [campo]: valor } : gasto
      )
    );
  };

  // Crecimiento en Costos y gastos - incrementoEgresos
  const [opcionSeleccionadaEgresos, setOpcionSeleccionadaEgresos] = useState("");
  const [incrementoEgresos, setIncrementoEgresos] = useState({
    2025: "",
    2026: "",
    2027: "",
    2028: "",
    2029: "",
  });

  const manejarCambioEgresos = (e) => {
    setOpcionSeleccionadaEgresos(e.target.value);
  };

  const manejarCambioCrecEgresos = (anio, valor) => {
    setIncrementoEgresos((prev) => ({ ...prev, [anio]: valor }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezoteEgresos} alt="Robot" className="robot-img-an" />
        </div>
        <div className="contenido-container">
          <div className="section">
            <img
              src={tituloEgresos}
              alt="Análisis del entorno"
              className="section-img5"
            />
          </div>

          <p>
            Detalle los conceptos de costos fijos asociados al proyecto y el
            valor mensual para el primer año. No incluya depreciación y gastos
            financieros que serán proyectados en forma independiente.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Costos Fijos */}
            <div className="proyeccion-container">
              <h3>Costos fijos y valor mensual</h3>
              <table className="tabla-estrategias">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="estrategia-celda-nombre">Concepto de costo fijo</th>
                    <th>Valor mensual</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {costos.map((costo, index) => (
                    <tr key={costo.id}>
                      <td>{index + 1}</td>
                      <td className="estrategia-celda-nombre">
                        <CustomInput
                          id={`concepto-costo-${costo.id}`}
                          value={costo.concepto}
                          onChange={(value) =>
                            manejarCambioCosto(costo.id, "concepto", value)
                          }
                          type="text"
                          placeholder="Ej: Internet"
                        />
                      </td>
                      <td>
                        <CustomInput
                          id={`valor-costo-${costo.id}`}
                          value={costo.valorMes}
                          onChange={(value) =>
                            manejarCambioCosto(costo.id, "valorMes", value)
                          }
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <button
                          className="estrategia-boton-eliminar"
                          onClick={() => eliminarCosto(costo.id)}
                          disabled={costos.length === 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {costos.length < 10 && (
                <button
                  className="estrategia-boton-agregar"
                  onClick={agregarCosto}
                  disabled={costos.length >= 10}
                >
                  + Agregar Costo Fijo
                </button>
              )}
            </div>

            <p>
            Detalle los conceptos de gastos administrativos (incluye los de administracion y ventas) asociados al proyecto y el valor mensual para el primer año. 
            No incluya salarios, depreciación y gastos financieros que serán proyectados en forma independiente más debajo de esta plantilla
          </p>

            {/* Gastos Administrativos */}
            <div className="proyeccion-container">
              <h3>Gastos administrativos y valor mensual</h3>
              <div className="gastos-const">
                <label htmlFor="input-gastos-const">Gastos de constitución:</label>
                <CustomInput
                  id="input-gastos-const"
                  type="number"
                  value={gastosConst}
                  onChange={(value) => setGastosConst(value)}
                />
              </div>

              <table className="tabla-estrategias">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="estrategia-celda-nombre">Concepto de gasto administrativo</th>
                    <th>Valor mensual</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, index) => (
                    <tr key={gasto.id}>
                      <td>{index + 1}</td>
                      <td className="estrategia-celda-nombre">
                        <CustomInput
                          id={`concepto-gasto-${gasto.id}`}
                          value={gasto.concepto}
                          onChange={(value) =>
                            manejarCambioGasto(gasto.id, "concepto", value)
                          }
                          type="text"
                          placeholder="Ej: Arriendo"
                        />
                      </td>
                      <td>
                        <CustomInput
                          id={`valor-gasto-${gasto.id}`}
                          value={gasto.valorMes}
                          onChange={(value) =>
                            manejarCambioGasto(gasto.id, "valorMes", value)
                          }
                          type="number"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <button
                          className="estrategia-boton-eliminar"
                          onClick={() => eliminarGasto(gasto.id)}
                          disabled={gastos.length === 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gastos.length < 10 && (
                <button
                  className="estrategia-boton-agregar"
                  onClick={agregarGasto}
                  disabled={gastos.length >= 10}
                >
                  + Agregar Gasto Administrativo
                </button>
              )}
            </div>

            <p>
              El crecimiento en COSTOS y GASTOS está representado en inflación
              o en otro porcentaje establecido en el plan operativo.
            </p>

            <div id="crecimiento-egresos" className="contenedor-crecimiento">
              <CustomInput
                id="opciones-incremento-egresos"
                type="radio"
                value={opcionSeleccionadaEgresos}
                onChange={manejarCambioEgresos}
                options={["PIB", "Estrategia", "IPC"]}
                name="metodoIncrementoEgresos"
              />
            </div>

            {opcionSeleccionadaEgresos === "Estrategia" && (
              <div id="incremento-egresos-estrategia">
                <p className="texto-estrategia">
                  En caso de que los gastos aumenten por otro porcentaje,
                  ingrese manualmente el mismo por cada año.
                </p>
                <h3>Incremento en Egresos</h3>
                <div className="fila-crecimiento">
                  {Object.keys(incrementoEgresos).map((anio) => (
                    <div key={anio} className="contenedor-input">
                      <span className="anio">Año {anio}</span>
                      <CustomInput
                        id={`incremento-egresos-${anio}`}
                        type="percentage"
                        value={incrementoEgresos[anio]}
                        onChange={(value) => manejarCambioCrecEgresos(anio, value)}
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
            <button className="nav-btn siguiente" onClick={() => navigate("/activosFijos")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CostosGastos;
