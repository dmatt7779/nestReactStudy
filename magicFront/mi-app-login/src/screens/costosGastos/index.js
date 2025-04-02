import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import analisisImg from "../../images/cabezote_analisis.png";
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png";


  const CostosGastos = () => {

      const navigate = useNavigate();
      // Costos fijos
      const [costos, setCostos] = useState([
        { id: Date.now(), concepto: "", valorMes: "" }, // Inicializa con un costo
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
        if (window.confirm("¿Está seguro de eliminar este producto?")) {
          setCostos(costos.filter((costo) => costo.id !== id));
        }
      };
    
      const manejarCambioCosto = (id, campo, valor) => {
        setCostos(
          costos.map((costo) =>
            costo.id === id ? { ...costo, [campo]: valor } : costo
          )
        );
      };

      // Gastos Administrativos
      const [gastos, setGastos] = useState([
        { id: Date.now(), concepto: "", valorMes: "" }, // Inicializa con un gasto
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
        if (window.confirm("¿Está seguro de eliminar este producto?")) {
          setGastos(gastos.filter((gasto) => gasto.id !== id));
        }
      };
    
      const manejarCambioGasto = (id, campo, valor) => {
        setGastos(
          gastos.map((gasto) =>
            gasto.id === id ? { ...gasto, [campo]: valor } : gasto
          )
        );
      };
  
      // Crecimiento en Costos y gastos - incrementoEgresos
    const [opcionSeleccionadaEgresos, setOpcionSeleccionadaEgresos] = useState("");
    const [incrementoEgresos, setIncrementoEgresos] = useState({
        2025: "", 2026: "", 2027: "", 2028: "", 2029: "",
      });
      
    const manejarCambioEgresos = (e) => {
        setOpcionSeleccionadaEgresos(e.target.value);
      };

    const manejarCambioCrecEgresos = (anio, valor) => {
        setIncrementoEgresos((prev) => ({ ...prev, [anio]: valor }));
      };

  // Enviar formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    //console.log("Valores enviados:", values);
    // Aquí podrías hacer una petición a la API para guardar los datos
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={analisisImg} alt="Robot" className="robot-img-an" />
        </div>
        <div className="contenido-container">
          {/* Sección de Análisis del Entorno */}
          <div className="section">
            <img src={tituloAnalisiImg} alt="Análisis del entorno" className="section-img1" />
          </div>
          <p>
          Dentro del mundo de los egresos, existe en el ámbito financiero tres (3) términos con diferencias claras:  Los costos son todos aquellos egresos que están relacionados
          directamente con la generación de la producción o prestación del servicio, mientras que los gastos son los que están relacionados con la parte administrativa y comercial.</p>  
          
          <p>Finalmente las inversiones corresponde a la adquisición de la infraestructura necesaria para la consolidación y capacidad máxima del proyecto.
          </p>

          <p>Detalle los conceptos de costos fijos asociados al proyecto y el valor mensual para el primer año.
            No incluya depreciación y gastos financieros que serán proyectados en forma independiente.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="costos-gastos-container">
              <h3>Costos de costos fijos y valor mes</h3>
              <div className="tabla-costos-gastos titulo-costos">
                {/* Filas dinámicas */}
                {costos.map((costo, index) => (
                  <div key={costo.id} className="fila-costos-producto">
                    <span className="numero-costos">{index + 1}.</span>

                    {/* Concepto de Costo Fijo */}
                    <div className="contenedor-input">
                      <CustomInput
                        id={`concepto-${costo.id}`}
                        type="text"
                        value={costo.concepto}
                        onChange={(value) => manejarCambioCosto(costo.id, "concepto", value)}
                        placeholder="Concepto de costo fijo"
                        className="input-costos"
                      />
                    </div>

                    {/* Valor Mes */}
                    <div className="contenedor-input">
                      <CustomInput
                        id={`valor-${costo.id}`}
                        type="number"
                        value={costo.valorMes}
                        onChange={(value) => manejarCambioCosto(costo.id, "valorMes", value)}
                        placeholder="Valor mes"
                        className="input-costos"
                      />
                    </div>

                    {/* Botón eliminar */}
                    <button
                      className="boton-eliminar-costos"
                      onClick={() => eliminarCosto(costo.id)}
                      disabled={costos.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón para agregar más costos */}
              {costos.length < 10 && (
                <button className="boton-agregar" onClick={agregarCosto}>
                  + Agregar Costo Fijo
                </button>
              )}
            </div>

            <p>
            Detalle los conceptos de gastos administrativos (incluye los de administracion y ventas) asociados al proyecto y el valor mensual para el primer año.
            No incluya salarios, depreciación y gastos financieros que serán proyectados en forma independiente más debajo de esta plantilla
            </p>


            {/* Sección de Gastos Administrativos */}
            <div className="costos-gastos-container">
            <h3>Costos de de gastos administrativos y valor mes</h3>
              <div className="tabla-costos-gastos titulo-costos">
                {/* Filas dinámicas */}
                {gastos.map((gasto, index) => (
                  <div key={gasto.id} className="fila-costos-producto">
                    <span className="numero-costos">{index + 1}.</span>

                    {/* Concepto de Gastos administrativos */}
                    <div className="contenedor-input">
                       <CustomInput
                        id={`concepto-${gasto.id}`}
                        label=""
                        type="text"
                        value={gasto.concepto}
                        onChange={(value) => manejarCambioGasto(gasto.id, "concepto", value)}
                        placeholder="Concepto de gasto administrativo"
                        className="input-costos"
                      />
                    </div>

                    {/* Valor Mes */}
                    <div className="contenedor-input">
                      <CustomInput
                        id={`valor-${gasto.id}`}
                        label=""
                        type="number"
                        value={gasto.valorMes}
                        onChange={(value) => manejarCambioGasto(gasto.id, "valorMes", value)}
                        placeholder="Valor mes"
                        className="input-costos"
                      />
                    </div>

                    {/* Botón eliminar */}
                    <button
                      className="boton-eliminar-costos" onClick={() => eliminarGasto(gasto.id)}
                      disabled={gastos.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón para agregar más gastos*/}
                {gastos.length < 10 && (
                <button className="boton-agregar" onClick={agregarGasto}>
                  + Agregar Gasto Administrativo
                </button>
              )}
            </div>

            {/* Crecimiento en Egreso*/}
            <p>El crecimiento en costos y gastos está representado en inflación o en otro porcentaje establecido en el plan operativo.</p>
            <div id="crecimiento-egresos" className="contenedor-crecimiento">
              <CustomInput
                id="opciones-incremento-egresos"
                label=""
                type="radio"
                value={opcionSeleccionadaEgresos}
                onChange={manejarCambioEgresos}
                options={["PIB", "Estrategia", "IPC"]}
                name="metodoIncrementoEgresos"
              />
            </div>

            {/* Campos de Crecimiento en Egresos (Solo si elige Estrategia) */}
            {opcionSeleccionadaEgresos === "Estrategia" && (
              <div id="incremento-egresos-estrategia">
                <p className="texto-estrategia">
                  En caso de que los gastos aumenten por otro porcentaje, ingrese manualmente el mismo por cada año.
                </p>
                <h3>Incremento en Egresos</h3>   
                <div className="fila-crecimiento">
                  {Object.keys(incrementoEgresos).map((anio) => (
                    <div key={anio} className="contenedor-input">
                      <span className="anio">Año {anio}</span> {/* Título del año */}
                      <CustomInput
                        id={`incremento-egresos-${anio}`} // ID único para cada año
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
            {/* Sección de Análisis de mercadeo y ventas - analisisMercado */}
            {/* <div className="section">
              <img src={tituloMercadeoImg} alt="Análisis del entorno" className="section-img5" />
            </div> */} 

          </form>

          {/* Botones de Navegación */}
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

export default CostosGastos;
