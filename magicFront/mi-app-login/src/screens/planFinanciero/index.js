import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezotePlanFin from "../../images/cabezote_plan_financiero.png";
import axiosClient from "../../utils/axios";

const PlanFinanciero = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. STATE BASE ---
  const [projectId, setProjectId] = useState(() => location.state?.projectId || sessionStorage.getItem("currentProjectId"));
  const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const previousProjectId = useRef(null);

  const calculateYears = useCallback((year) => {
    const startYear = parseInt(year, 10);
    return Array.from({ length: 5 }, (_, i) => startYear + i);
  }, []);

  const [years, setYears] = useState(() => calculateYears(openingYear));

  useEffect(() => {
    setYears(calculateYears(openingYear));
  }, [openingYear, calculateYears]);

  // --- 2. ESTADOS DE ESTA PANTALLA ---
  const [datos, setDatos] = useState({
    disponibleInicial: "",
    diasInventarioInicial: "",
    financiacionPropia: "",
    plazoCredito: "",
    tasaCredito: "",
    tasaProveedores: "",
    tmrr: "",
    tasaReinversion: "",
    impuestosRenta: "",
    diasCartera: "",
    diasInventario: "",
    diasPagoProveedores: "",
    tarfiaIndCcio: "",
    gmf4xmil: "",
    saldoMinCaja: "",
  });

  // Nuevo estado: porcentaje del "Inicio {years[0]}"
  const [inversionInicio, setInversionInicio] = useState(0);

  // Mantén los 5 años como antes
  const [inversionActivos, setInversionActivos] = useState([0, 0, 0, 0, 0]);
  const [repartoDividendos, setRepartoDividendos] = useState([0, 0, 0, 0, 0]);

  // --- 3. CARGA DE DATOS ---
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
        Object.keys(datos).forEach((key) => {
          if (data[key] !== undefined) {
            datosDesdeApi[key] = data[key].toString();
          }
        });
        setDatos(datosDesdeApi);

        if (data.propuestaFinanciera) {
            const af = data.propuestaFinanciera.activosFijos || [];
            if (Array.isArray(af) && af.length === 6) {
                setInversionInicio(Number(af[0]) || 0);
                setInversionActivos([
                Number(af[0]) || 0,
                Number(af[1]) || 0,
                Number(af[2]) || 0,
                Number(af[3]) || 0,
                Number(af[4]) || 0,
                Number(af[5]) || 0,
                ]);
            }else {
                setInversionInicio(Number(data.propuestaFinanciera.activosFijosInicio) || 0);
                const five = (af || []).slice(0, 5);
                while (five.length < 5) five.push(0);
                setInversionActivos(five);
            }
            const inicioApi = Number(data.propuestaFinanciera.activosFijosInicio) || 0;
            setInversionInicio(inicioApi);
            const dividendosApi = data.propuestaFinanciera.utilidadNetaDividendo || [0, 0, 0, 0];
            setRepartoDividendos([0, ...dividendosApi]);
        }
      } catch (planFinancieroError) {
        if (planFinancieroError.statusCode === 404) {
          console.warn("No se encontraron datos de Plan Financiero. Mostrando formulario vacío.");
          setDataExists(false);
          setDatos(Object.fromEntries(Object.keys(datos).map((key) => [key, ""])));
          setInversionActivos([0, 0, 0, 0, 0]);
          setInversionInicio(0);
          setRepartoDividendos([0, 0, 0, 0, 0]);
        } else {
          setError(planFinancieroError.message || "Error al cargar los datos.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanFinanciero();
  }, [projectId]);

  // --- 4. MANEJADORES ---
  const manejarCambio = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const actualizarArray = (index, valor, tipo) => {
    const nuevoValor = parseFloat(valor) || 0;
    if (tipo === "inversion") {
      const actualizado = [...inversionActivos];
      actualizado[index] = nuevoValor;
      setInversionActivos(actualizado);
    } else if (tipo === "dividendos") {
      const actualizado = [...repartoDividendos];
      actualizado[index] = nuevoValor;
      setRepartoDividendos(actualizado);
    }
  };

  // --- 5. SUBMIT ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const dataToSend = { ...datos };
    for (const key in dataToSend) {
      dataToSend[key] = parseFloat(dataToSend[key]) || 0;
    }

    // Mantén el payload original y agrega, sin romper, el nuevo campo opcional
    dataToSend.propuestaFinanciera = {
      activosFijosInicio: inversionInicio, // NUEVO (el backend lo puede ignorar por ahora)
      activosFijos: inversionActivos,      // 5 años como antes
      utilidadNetaDividendo: repartoDividendos.slice(1),
    };

    try {
      if (dataExists) {
        // await axiosClient.put(`/api/v1/plan-financiero/${projectId}`, dataToSend);
      } else {
        await axiosClient.postPlanFinanciero(`/api/v1/plan-financiero/${projectId}`, dataToSend);
      }
      navigate("/newProject", { state: { projectId, openingYear } });
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  // --- 6. RENDER ---
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

  const totalActual = (Number(inversionInicio) || 0) + inversionActivos.reduce((a, b) => a + (Number(b) || 0), 0);
  const totalOk = Math.abs(totalActual - 100) < 1e-6;

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezotePlanFin} alt="Robot" className="robot-img-p" />
        </div>
        <div className="contenido-container-p">
          <p>Una vez cuantificados los ingresos...</p>
          <form onSubmit={handleSubmit}>
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
                    <CustomInput id={id} type={tipo} value={datos[id]} onChange={(valor) => manejarCambio(id, valor)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="tabla-plan-financiero">
              <h3>PROPUESTA</h3>

              {/* --- Porcentaje de ejecución con "Inicio + AñoInicial" --- */}
              <div className="tabla-subseccion">
                <p>
                  <strong>Porcentaje de Ejecución de la Inversión Inicial (Debe totalizar 100%)</strong>
                </p>

                <div className="fila-crecimiento">
                  {[
                    "Ejecución Inversión",
                    `Inicio ${years[0]}`, // NUEVO
                    `Año ${years[0]}`,
                    `Año ${years[1]}`,
                    `Año ${years[2]}`,
                    `Año ${years[3]}`,
                    `Año ${years[4]}`,
                  ].map((label, i) => (
                    <div key={i} className="celda">
                      <label>{label}</label>

                      {/* Columna 0 = sólo etiqueta */}
                      {i === 1 && (
                        <CustomInput
                          type="percentage"
                          value={inversionInicio}
                          onChange={(v) => setInversionInicio(parseFloat(v) || 0)}
                        />
                      )}

                      {/* i > 1 => los 5 años como antes, desplazados en 1 */}
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
                  <strong style={{ color: totalOk ? "inherit" : "crimson" }}>
                    {Number(totalActual.toFixed(2))}%
                  </strong>
                </p>
              </div>

              {/* --- Dividendos --- */}
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
            <button type="button" className="nav-btn siguiente" onClick={handleSubmit}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanFinanciero;
