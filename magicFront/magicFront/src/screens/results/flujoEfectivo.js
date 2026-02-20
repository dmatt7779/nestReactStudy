import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloFlujoEfectivo from "../../images/titulo_flujo_efectivo.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";

const FlujoEfectivo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  // 6 columnas: Inicio YEAR, YEAR, YEAR+1, YEAR+2, YEAR+3, YEAR+4
  const anios = [`Inicio ${openingYear}`, ...Array.from({ length: 5 }, (_, i) => openingYear + i)];

  // Mapeo de filas → cada fila sabe su ruta dentro de flujoEfectivo
  // "section" = ruta al sub-objeto, "field" = campo dentro de ese sub-objeto
  // Para campos del nivel raíz de flujoEfectivo, section es null
  const estructura = [
    { tipo: "titulo", titulo: "Actividad de operación" },
    { tipo: "separador" },
    { label: "Ventas de contado",              section: "actividadOperacion", field: "ventasContado" },
    { label: "Recuperación de cartera",        section: "actividadOperacion", field: "recuperacionCartera" },
    { label: "Costos operativos",              section: "actividadOperacion", field: "costosOperativos" },
    { label: "Gastos operativos",              section: "actividadOperacion", field: "gastosOperativos" },
    { label: "Pago de proveedores",            section: "actividadOperacion", field: "pagoProveedores" },
    { label: "Inversión en Inventario Inicial", section: "actividadOperacion", field: "inversionInventarioInicial" },
    { label: "Impuestos",                      section: "actividadOperacion", field: "flujoEfectivoImpuestos" },
    { label: "Depreciación y amortización ( - )", section: "actividadFinanciacion", field: "depreciacionAmortizacion" },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Actividad de financiación" },
    { tipo: "separador" },
    { label: "Aportes Inicial de capital por Socios", section: "actividadFinanciacion", field: "capitalInicialSocios" },
    { label: "Adquisición de préstamos",       section: "actividadFinanciacion", field: "adquiPrestamos" },
    { label: "Aporte ADICIONAL de capital por Socios", section: "actividadFinanciacion", field: "feCapitalAdicionalSocios" },
    { label: "Rendimientos financieros",       section: "actividadFinanciacion", field: "rendimientosFinancieros" },
    { label: "Servicio de la deuda",           section: "actividadFinanciacion", field: "servicioDeuda" },
    { label: "Intereses",                      section: "actividadFinanciacion", field: "flujoEfectivoIntereses" },
    { label: "Dividendos según el ejercicio anterior", section: "actividadFinanciacion", field: "flujoEfectivoDividendos" },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Actividad de inversión" },
    { tipo: "separador" },
    { label: "Venta de activos fijos",         section: "actividadInversion", field: "ventaActivosFijos" },
    { label: "Inversión activos fijos",        section: "actividadInversion", field: "inversionActivosFijos" },
    { tipo: "separador" },

    { label: "Excedente o déficit efectivo",   section: null, field: "excedenteDeficitEfectivo", dark: true },
    { tipo: "separador" },

    { label: "Decisión Junta Directiva (Aporte Socios)", section: null, field: "aporteSocios", red: true },
    { tipo: "separador" },

    { label: "Saldo inicial",                  section: null, field: "flujoEfectivoSaldoInicial", dark: true },
    { tipo: "separador" },

    { label: "Saldo final de efectivo",        section: null, field: "flujoEfectivoSaldoFinal", dark: true },
  ];

  const [valores, setValores] = useState({});
  const [analisis, setAnalisis] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (resultadosCalculados && Object.keys(resultadosCalculados).length > 0) {
          const result = resultadosCalculados.result;
          console.log("📊 flujoEfectivo (navegación):", result.flujoEfectivo);
          setValores(result);
        } else {
          console.log("🔄 Obteniendo resultados de la BD para projectId:", projectId);
          const data = await axiosClient.getResults(projectId);
          const result = data.result;
          console.log("📊 flujoEfectivo (BD):", result.flujoEfectivo);
          setValores(result);
        }
      } catch (error) {
        console.error("❌ Error cargando flujo de efectivo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId, resultadosCalculados]);

  const handleGuardar = (e) => {
    e.preventDefault();
    alert("Progreso guardado correctamente.");
  };

  // Formatea un número como moneda COP con máximo 2 decimales
  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "";
    
    // Determinar cuántos decimales mostrar (max 2)
    const absValue = Math.abs(value);
    const decimalsNeeded = absValue % 1 === 0 ? 0 : absValue * 10 % 1 === 0 ? 1 : 2;

    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: decimalsNeeded,
      maximumFractionDigits: decimalsNeeded,
    });
  };

  // Obtiene el valor raw para una fila y una columna (índice de la columna)
  const getCellValue = (item, colIndex) => {
    const flujo = valores.flujoEfectivo;
    if (!flujo) return null;

    // Obtener el dato: si tiene sección, buscar en sub-objeto; si no, en raíz
    const rawData = item.section
      ? flujo[item.section]?.[item.field]
      : flujo[item.field];

    if (rawData == null) return null;

    // Si es un escalar (no array), solo mostrarlo en la primera columna (Inicio)
    if (!Array.isArray(rawData)) {
      return colIndex === 0 ? rawData : null;
    }

    // Si es array, depende del largo:
    // 6 elementos → índices 0-5 mapeados a las 6 columnas (Inicio + 5 años)
    // 5 elementos → índices 0-4 mapeados a las columnas 1-5 (solo años, sin Inicio)
    // 4 elementos → índices 0-3 mapeados a las columnas 2-5 (año 2 en adelante)
    const len = rawData.length;
    if (len === 6) {
      return rawData[colIndex] ?? null;
    } else if (len === 5) {
      // Columna 0 (Inicio) no tiene dato, columnas 1-5 → índices 0-4
      return colIndex === 0 ? null : (rawData[colIndex - 1] ?? null);
    } else if (len === 4) {
      // Columnas 0-1 no tienen dato, columnas 2-5 → índices 0-3
      return colIndex <= 1 ? null : (rawData[colIndex - 2] ?? null);
    }
    // Caso genérico
    return rawData[colIndex] ?? null;
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img
            src={tituloFlujoEfectivo}
            alt="Flujo de Efectivo"
            className="robot-img-an-re"
          />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              El flujo de efectivo es el movimiento neto de dinero, tanto entradas como salidas, que ingresa y sale de una empresa o negocio durante un período determinado. Sirve como un indicador de la salud financiera, mostrando la liquidez de la compañía y su capacidad para cubrir gastos y obligaciones.
            </p>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.field || `row-${i}`}>
                      {/* TITULOS DE SECCIÓN CON AÑOS */}
                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          <td className="estado-concepto fila-aporte-adicional">
                            {item.titulo}
                          </td>
                          {anios.map((anio, index) => (
                            <td key={index} className="estado-celda fila-anios">{anio}</td>
                          ))}
                        </tr>
                      )}

                      {/* FILAS DE DATOS */}
                      {item.field && (
                        <tr
                          className={`estado-fila 
                           ${item.dark ? "fila-black" : ""}
                           ${item.red ? "fila-red" : ""}
                           ${item.field === "aporteSocios" ? "fila-decision-roja" : ""}
                          `}
                        >
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio, colIndex) => {
                            const val = getCellValue(item, colIndex);
                            return (
                              <td key={colIndex} className="estado-celda">
                                <span className="estado-dato">
                                  {val != null ? formatCurrency(val) : ""}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      )}

                      {/* MENSAJE EXPLICATIVO */}
                      {item.field === "aporteSocios" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="mensaje-explicacion">
                            En caso de que se presente un monto en la "Decisión Junta
                            Directiva", se deberá explicar las razones de esta cifra y
                            plantear una solución financiera.
                          </td>
                        </tr>
                      )}

                      {/* FILA SEPARADOR */}
                      {item.tipo === "separador" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="empty-row"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              <div className="estado-analisis-container">
                <img
                  src={tituloComentarios}
                  alt="Comentarios"
                  className="robot-img-an-re"
                />
                <textarea
                  id="ana-flujo-efec"
                  rows={10}
                  className="estado-textarea"
                  placeholder="Escribe aquí tu análisis..."
                  value={analisis}
                  onChange={(e) => setAnalisis(e.target.value)}
                />
              </div>
            </div>

            <div className="guardar-avance-wrapper">
              <button type="submit" className="guardar-avance-container">
                <span className="guardar-avance-texto">
                  <strong>Antes de seguir</strong>, asegúrate de guardar tu progreso. Haz clic aquí para no perder tu avance.
                </span>
                <div className="guardar-avance-icono">
                  <DownloadCloud size={24} />
                </div>
              </button>
            </div>

            <div className="buttons-container">
              <button className="nav-btn anterior" type="button" onClick={() => navigate(-1)}></button>
              <button
                className="nav-btn siguiente"
                type="button"
                onClick={() => navigate("/estadoSituaFin", {
                  state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores } : null }
                })}
              ></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default FlujoEfectivo;
