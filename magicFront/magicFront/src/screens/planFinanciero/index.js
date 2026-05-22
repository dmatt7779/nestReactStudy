import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
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
    return String(dato).replace(/[^0-9.\-]/g, '') || "0";
};

const PlanFinanciero = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 2. CONFIGURACIÓN DE CAMPOS ---
  const campos = [
    {
      nombre: "Disponible inicial",
      id: "disponibleInicial",
      tipo: "number",
      placeholder: "Ej: $5.000.000",
      descripcion: "Ingrese los meses de capital de trabajo estimados que necesita reservar al inicio del proyecto (Mientras el negocio empiece a dar Ingresos).",
    },
    {
      nombre: "Días de inventario inicial",
      id: "diasInventarioInicial",
      tipo: "number",
      placeholder: "Ej: 30",
      descripcion: " En caso de tener inventario, ingrese los días de inventario inicial para el proyecto (Cuidado si los productos son Perecederos).",
    },
    {
      nombre: "Financiación propia",
      id: "financiacionPropia",
      tipo: "number",
      placeholder: "Ej: $20.000.000",
      descripcion: "Del total de la inversión necesaria, ingrese cuanto dinero se dispondrá como capital propio (en pesos colombianos), el modelo determinará la diferencia como préstamo y realizará automáticamente el plan de amortización.",
    },
    {
      nombre: "Plazo del crédito (meses)",
      id: "plazoCredito",
      tipo: "number",
      placeholder: "Ej: 36",
      descripcion: " Ingrese el plazo de una línea de crédito en meses. No debe ser mayor al período de evaluación.",
    },
    {
      nombre: "Tasa del crédito (% E.A.)",
      id: "tasaCredito",
      tipo: "percentage",
      placeholder: "Ej: 18%",
      descripcion: "Ingrese la tasa de interés Efectiva Anual estimada para el préstamo.",
    },
    {
      nombre: "Costo proveedores (% E.A.)",
      id: "tasaProveedores",
      tipo: "percentage",
      placeholder: "Ej: 12%",
      descripcion: "Ingrese el costo financiero de los proveedores (costo de financiación por parte de proveedores) si existe.",
    },
    {
      nombre: "TMRR o COK (% E.A.)",
      id: "tmrr",
      tipo: "percentage",
      placeholder: "Ej: 20%",
      descripcion: "Ingrese la Tasa Anual mínima de rentabilidad requerida para el accionista (También se denomina Costo de Oportunidad de Capital).",
    },
    {
      nombre: "Tasa de Reinversión (% E.A.)",
      id: "tasaReinversion",
      tipo: "percentage",
      placeholder: "Ej: 8%",
      descripcion: "Ingrese la Tasa Anual estimada de rentabilidad que espera tener en la inversión diversificada de excedentes de tesorería (Invertir en otras   opciones de inversión, diferente al Negocio Original) (Se sugiere la tasa de un CDT).",
    },
    {
      nombre: "Tasa impuestos de Renta (%)",
      id: "impuestosRenta",
      tipo: "percentage",
      placeholder: "Ej: 35%",
      descripcion: "Ingrese la Tasa Anual del Impuesto de Renta estipulada por la DIAN para los próximos años.",
    },
    {
      nombre: "Días cartera",
      id: "diasCartera",
      tipo: "number",
      placeholder: "Ej: 30",
      descripcion: "Determine la política de días de cartera o recuperación de ventas a crédito.",
    },
    {
      nombre: "Días inventario",
      id: "diasInventario",
      tipo: "number",
      placeholder: "Ej: 15",
      descripcion: "Determine la política de días de inventarios y su rotación en caso de que aplique (Cuidado si los productos son Perecederos).",
    },
    {
      nombre: "Días pago a proveedores",
      id: "diasPagoProveedores",
      tipo: "number",
      placeholder: "Ej: 30",
      descripcion: "Determine la política de días de pago a proveedores.",
    },
    {
      nombre: "Tarifa Ind y Ccio (%)",
      id: "tarfiaIndCcio",
      tipo: "percentage",
      placeholder: "Ej: 5%",
      descripcion: "Ingrese la Tarifa de Impuesto de Industria y Comercio (%) para la actividad que desarrolla (Escriba el valor en porcentaje:   Por ejemplo, para el  10 x mil, digite 1 y el reglon aparecera 1%).",
    },
    {
      nombre: "GMF (4 x mil)",
      id: "gmf4xmil",
      tipo: "percentage",
      placeholder: "0.4%",
      descripcion: "Ingrese la Tarifa de Gravamen (%) de Movimiento Financiero (Escriba el valor en porcentaje: Por ejemplo, el 7 x mil, digite 0,7 y el reglon aparecera 0,7%).",
    },
    {
      nombre: "Saldo mínimo caja",
      id: "saldoMinCaja",
      tipo: "number",
      placeholder: "Ej: $50.000.000",
      descripcion: "Ingrese el valor estimado del Saldo mínimo de efectivo (Caja Menor) para cubrir la operación normal de uno (1) a dos (2) meses a nivel de Capital de Trabajo.",
    },
  ];

  // --- 3. STATE ---
  const [projectId, setProjectId] = useState(() => location.state?.projectId || sessionStorage.getItem("currentProjectId"));
  const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());

  const [isLoading, setIsLoading] = useState(true);
  const { isProcessing, runWithLoader } = useProcessing();
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
                    datosDesdeApi[campo.id] = (valorRaw == null) ? "" : valorRaw.toString();
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

            const inversionAnios = fullArray.slice(1, 6).map(v => (v == null) ? "" : v.toString());
            setInversionActivos(inversionAnios);

            const divApi = pf.utilidadNetaDividendo || [0, 0, 0, 0, 0];
            const mapArray = (arr) => arr.map(v => (v == null) ? "" : v.toString());
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
          console.error("Error al cargar los datos.", planFinancieroError);
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

  // --- 8. NAVIGATION & SUBMIT ---
  const handleGoBack = async () => {
    await runWithLoader(async () => {});
    navigate(-1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let navTarget = null;

    await runWithLoader(async () => {
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
        console.log("Guardando Plan Financiero (Upsert)...");
        await axiosClient.postPlanFinanciero(`/api/v1/plan-financiero/${projectId}`, dataToSend);

        console.log("Obteniendo resumen del proyecto...");
        const timestamp = new Date().getTime();
        const summaryData = await axiosClient.getProjectSummary(`/api/v1/project-summary/${projectId}?t=${timestamp}`);
        
        console.log("Enviando a motor de cálculo (Python)...");
        const excelResult = await axiosClient.calculateExcel(summaryData);
        
        console.log("Resultado del cálculo recibido:", excelResult);
        await axiosClient.saveResults(projectId, excelResult);
        
        navTarget = { 
            path: "/estadoResultados", 
            state: { projectId, openingYear, resultadosCalculados: excelResult } 
        };
      } catch (err) {
        console.error("Error en el proceso:", err);
      }
    });
    if (navTarget) navigate(navTarget.path, { state: navTarget.state });
  };

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="project-info-container">
      {isProcessing && <CeipaLoader />}
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezotePlanFin} alt="Robot" className="robot-img-p" />
        </div>
        <div className="contenido-container-p">
          <p>Una vez cuantificados los ingresos, costos, gastos e inversión, se requiere información complementaria para elaborar el
plan financiero, como son políticas, tasas, impuestos y otros datos. Ingrese cada dato teniendo en cuenta las estrategias para el desarrollo del proyecto.</p>
          
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            
            <div className="formulario-datos">
              {campos.map(({ nombre, id, tipo, descripcion, placeholder }) => (
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
                        placeholder={placeholder}
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
                 La suma debe totalizar 100%. Total actual:{" "}
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
                <p>Los porcentajes no pueden superar el 100%. Total actual: {" "}
                  <strong style={{ color: esPorcentajeValido ? "inherit" : "crimson" }}>
                    100%
                  </strong>
                  {!esPorcentajeValido && <span style={{color: "red", marginLeft: "10px"}}>(Excede el 100%)</span>}
                </p>
                <h3>Nota</h3>
                <p>Financiación Adicional de Capital de Trabajo (PQC). En caso que su proyecto de como resultado pérdidas en algunos períodos de tiempo (años), los dueños deberán asumir los compromisos deficitarios.</p>
              </div>
            </div>
          </form>

          <div className="buttons-container">
            <button type="button" className="nav-btn anterior" onClick={handleGoBack}>&lt; Anterior</button>
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