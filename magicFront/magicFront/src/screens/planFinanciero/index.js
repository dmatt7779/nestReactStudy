import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezotePlanFin from "../../images/cabezote_plan_financiero.png";
import axiosClient from "../../utils/axios";

// --- 1. FUNCIONES AUXILIARES ---

const extraerValor = (input) => {
    if (input && typeof input === 'object' && input.target && typeof input.target.value !== 'undefined') {
        return input.target.value;
    }
    return input;
};

const limpiarNumero = (valor) => {
    const dato = extraerValor(valor);
    if (dato === null || dato === undefined || dato === "") return "";
    return String(dato).split(/[.,]/)[0].replace(/\D/g, ''); 
};

const PlanFinanciero = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 2. CONFIGURACIÓN DE CAMPOS ---
  const campos = [
    { nombre: "Disponible inicial", id: "disponibleInicial", tipo: "number", descripcion: "..." },
    { nombre: "Días de inventario inicial", id: "diasInventarioInicial", tipo: "number", descripcion: "..." },
    { nombre: "Financiación propia", id: "financiacionPropia", tipo: "number", descripcion: "..." },
    { nombre: "Plazo del crédito (meses)", id: "plazoCredito", tipo: "number", descripcion: "..." },
    { nombre: "Tasa del crédito (% E.A.)", id: "tasaCredito", tipo: "percentage", descripcion: "..." },
    { nombre: "Costo proveedores (% E.A.)", id: "tasaProveedores", tipo: "percentage", descripcion: "..." },
    { nombre: "TMRR o COK (% E.A.)", id: "tmrr", tipo: "percentage", descripcion: "..." },
    { nombre: "Tasa de Reinversión (% E.A.)", id: "tasaReinversion", tipo: "percentage", descripcion: "..." },
    { nombre: "Tasa impuestos de Renta (%)", id: "impuestosRenta", tipo: "percentage", descripcion: "..." },
    { nombre: "Días cartera", id: "diasCartera", tipo: "number", descripcion: "..." },
    { nombre: "Días inventario", id: "diasInventario", tipo: "number", descripcion: "..." },
    { nombre: "Días pago a proveedores", id: "diasPagoProveedores", tipo: "number", descripcion: "..." },
    { nombre: "Tarifa Ind y Ccio (%)", id: "tarfiaIndCcio", tipo: "percentage", descripcion: "..." },
    { nombre: "GMF (4 x mil)", id: "gmf4xmil", tipo: "percentage", descripcion: "..." },
    { nombre: "Saldo mínimo caja", id: "saldoMinCaja", tipo: "number", descripcion: "..." },
  ];

  // --- 3. STATE ---
  const [projectId, setProjectId] = useState(() => location.state?.projectId || sessionStorage.getItem("currentProjectId"));
  const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const previousProjectId = useRef(null);

  const [formularioCompleto, setFormularioCompleto] = useState(false);

  const calculateYears = useCallback((year) => {
    const startYear = parseInt(year, 10);
    return Array.from({ length: 5 }, (_, i) => startYear + i);
  }, []);

  const [years, setYears] = useState(() => calculateYears(openingYear));

  useEffect(() => {
    setYears(calculateYears(openingYear));
  }, [openingYear, calculateYears]);

  const [datos, setDatos] = useState(
      Object.fromEntries(campos.map(c => [c.id, ""]))
  );

  const [inversionActivos, setInversionActivos] = useState(["", "", "", "", ""]);
  const [repartoDividendos, setRepartoDividendos] = useState(["", "", "", "", ""]);

  // --- 4. CÁLCULO DINÁMICO DEL "INICIO" ---
  const calcularRestanteInicio = () => {
      const sumaAnios = inversionActivos.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      const restante = 100 - sumaAnios;
      return parseFloat(restante.toFixed(2));
  };

  const restanteInicio = calcularRestanteInicio();
  const esPorcentajeValido = restanteInicio >= 0;

  // --- 5. VALIDACIÓN DEL FORMULARIO ---
  useEffect(() => {
      const datosCompletos = Object.values(datos).every(val => String(val).trim() !== "");
      const logicaInversionOk = restanteInicio >= 0;
      const dividendosCompletos = repartoDividendos.slice(1).every(val => String(val).trim() !== "");
      setFormularioCompleto(datosCompletos && logicaInversionOk && dividendosCompletos);
  }, [datos, inversionActivos, repartoDividendos, restanteInicio]);


  // --- 6. CARGA DE DATOS ---
  useEffect(() => {
    if (projectId) {
      sessionStorage.setItem("currentProjectId", projectId);
    }

    const fetchPlanFinanciero = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      previousProjectId.current = projectId;

      try {
        const response = await axiosClient.get(`/api/v1/plan-financiero/${projectId}`);
        const data = response.planFinanciero;
        setDataExists(true);

        const datosDesdeApi = {};
        campos.forEach((campo) => {
            if (data[campo.id] !== undefined) {
                const valorRaw = data[campo.id];
                if (campo.tipo === "number") {
                    datosDesdeApi[campo.id] = limpiarNumero(valorRaw);
                } else {
                    datosDesdeApi[campo.id] = (valorRaw === 0 || valorRaw === null) ? "" : valorRaw.toString();
                }
            } else {
                datosDesdeApi[campo.id] = "";
            }
        });
        setDatos(datosDesdeApi);

        if (data.propuestaFinanciera) {
            const pf = data.propuestaFinanciera;
            
            const arrActivos = Array.isArray(pf.activosFijos) ? pf.activosFijos : [];
            const fullArray = [...arrActivos];
            while(fullArray.length < 6) fullArray.push(0);

            const inversionAnios = fullArray.slice(1, 6).map(v => (v === 0 || v === null) ? "" : v);
            setInversionActivos(inversionAnios);

            const divApi = pf.utilidadNetaDividendo || [0, 0, 0, 0, 0];
            const mapArray = (arr) => arr.map(v => (v === 0 || v === null || v === undefined) ? "" : v);
            setRepartoDividendos(mapArray(divApi));
        }

      } catch (planFinancieroError) {
        if (planFinancieroError.statusCode === 404) {
          console.warn("No se encontraron datos. Mostrando formulario vacío.");
          setDataExists(false);
          setDatos(Object.fromEntries(campos.map(c => [c.id, ""])));
          setInversionActivos(["", "", "", "", ""]);
          setRepartoDividendos(["", "", "", "", ""]);
        } else {
          setError(planFinancieroError.message || "Error al cargar los datos.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanFinanciero();
  }, [projectId]);

  // --- 7. MANEJADORES ---

  const manejarCambio = (id, valor) => {
    const campoConfig = campos.find(c => c.id === id);
    const tipo = campoConfig ? campoConfig.tipo : "text";

    let valorFinal;
    if (tipo === "number") {
        valorFinal = limpiarNumero(valor);
    } else {
        valorFinal = extraerValor(valor);
    }
    setDatos((prev) => ({ ...prev, [id]: valorFinal }));
  };

  const actualizarArray = (index, valor, tipo) => {
    const rawValue = extraerValor(valor);
    
    if (tipo === "inversion") {
      const actualizado = [...inversionActivos];
      actualizado[index] = rawValue;
      setInversionActivos(actualizado);
    } else if (tipo === "dividendos") {
      const actualizado = [...repartoDividendos];
      actualizado[index] = rawValue;
      setRepartoDividendos(actualizado);
    }
  };

  // --- 8. SUBMIT & PROCESAMIENTO ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const dataToSend = { ...datos };
    for (const key in dataToSend) {
      dataToSend[key] = parseFloat(dataToSend[key]) || 0;
    }

    const valAnios = inversionActivos.map(v => parseFloat(v) || 0);
    const mergedActivosFijos = [restanteInicio, ...valAnios];
    const cleanDividendos = repartoDividendos.map(v => parseFloat(v) || 0);
    
    dataToSend.propuestaFinanciera = {
      activosFijos: mergedActivosFijos, 
      utilidadNetaDividendo: cleanDividendos, 
    };

    try {
      // 1. PRIMERO: Guardar/Actualizar los datos del Plan Financiero
      if (dataExists) {
        console.log("Actualizando Plan Financiero...");
        // await axiosClient.put(...) 
      } else {
        await axiosClient.postPlanFinanciero(`/api/v1/plan-financiero/${projectId}`, dataToSend);
        console.log("Guardando Plan Financiero...");
      }

      // 2. SEGUNDO: Obtener el Resumen del Proyecto (Data para Python)
      console.log("Obteniendo resumen del proyecto...");
      const timestamp = new Date().getTime();
      const summaryData = await axiosClient.getProjectSummary(`/api/v1/project-summary/${projectId}?t=${timestamp}`);
      
      console.log("Data recibida para cálculo:", summaryData);

      // 3. TERCERO: Enviar a FastAPI (Python) para cálculo
      console.log("Enviando a motor de cálculo (Python)...");
      const excelResult = await axiosClient.calculateExcel(summaryData);
      
      console.log("Resultado del cálculo recibido:", excelResult);
      await axiosClient.saveResults(projectId, excelResult);
      
      // 4. CUARTO: Navegar a Resultados
      console.log("Proceso terminado. Navegando a resultados...");
      
      // Puedes pasar el resultado de Python en el state si lo necesitas mostrar inmediatamente
      navigate("/estadoResultados", { 
          state: { 
              projectId,
              openingYear,
              resultadosCalculados: excelResult // Pasamos la data calculada a la siguiente pantalla
          } 
      });
    } catch (err) {
      console.error("Error en el proceso:", err);
      setError(err.message || "Ocurrió un error al procesar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezotePlanFin} alt="Robot" className="robot-img-p" />
        </div>
        <div className="contenido-container-p">
          <p>Una vez cuantificados los ingresos...</p>
          
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            
            <div className="formulario-datos">
              {campos.map(({ nombre, id, tipo, descripcion }) => (
                <div key={id} className="bloque-dato">
                  <div className="bloque-info">
                    <label htmlFor={id} className="titulo-dato">
                      {nombre}
                    </label>
                    <p className="descripcion-dato">{descripcion}</p>
                  </div>
                  <div className="input-wrapper">
                    <CustomInput 
                        id={id} 
                        type={tipo} 
                        value={datos[id]} 
                        onChange={(valor) => manejarCambio(id, valor)} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="tabla-plan-financiero">
              <h3>PROPUESTA</h3>

              <div className="tabla-subseccion">
                <p>
                  <strong>Porcentaje de Ejecución de la Inversión Inicial (Debe totalizar 100%)</strong>
                </p>

                <div className="fila-crecimiento">
                  {[
                    "Ejecución Inversión",
                    `Inicio ${years[0]}`,
                    `Año ${years[0]}`,
                    `Año ${years[1]}`,
                    `Año ${years[2]}`,
                    `Año ${years[3]}`,
                    `Año ${years[4]}`,
                  ].map((label, i) => (
                    <div key={i} className="celda">
                      <label>{label}</label>
                      {i === 1 && (
                        <CustomInput
                          type="percentage"
                          value={restanteInicio} 
                          disabled={true}
                          style={{ 
                              backgroundColor: "#f0f0f0", 
                              color: esPorcentajeValido ? "inherit" : "red",
                              fontWeight: "bold"
                          }}
                        />
                      )}
                      {i > 1 && (
                        <CustomInput
                          type="percentage"
                          value={inversionActivos[i - 2]}
                          onChange={(v) => actualizarArray(i - 2, v, "inversion")}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <p>
                  Total actual:{" "}
                  <strong style={{ color: esPorcentajeValido ? "inherit" : "crimson" }}>
                    100%
                  </strong>
                  {!esPorcentajeValido && <span style={{color: "red", marginLeft: "10px"}}>(Excede el 100%)</span>}
                </p>
              </div>

              <div className="tabla-subseccion">
                <p>
                  <strong>Política de Reparto de Dividendos según el Porcentaje de la Utilidad Neta</strong>
                </p>
                <div className="fila-crecimiento">
                  {[
                    `Año ${years[0]}`,
                    `Año ${years[1]}`,
                    `Año ${years[2]}`,
                    `Año ${years[3]}`,
                    `Año ${years[4]}`,
                  ].map((anio, i) => (
                    <div key={i} className="celda">
                      <label>{anio}</label>
                      {i === 0 ? (
                        <input disabled className="input-disabled" />
                      ) : (
                        <CustomInput
                          type="percentage"
                          value={repartoDividendos[i]}
                          onChange={(v) => actualizarArray(i, v, "dividendos")}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          <div className="buttons-container">
            <button type="button" className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button 
                type="button" 
                className="nav-btn procesar" 
                onClick={handleSubmit}
                disabled={!formularioCompleto}
                style={{
                    opacity: formularioCompleto ? 1 : 0.5,
                    cursor: formularioCompleto ? 'pointer' : 'not-allowed'
                }}
            >
                Procesar
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanFinanciero;