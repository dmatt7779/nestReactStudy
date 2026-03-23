import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloIndicadores from "../../images/titulo_indicadores.png";
import tituloRentabilidad from "../../images/indi_ren.png";
import tituloGeneracion from "../../images/indi_ge_va.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud, FileDown } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
import { useRole } from "../../hooks/useRole";

const Indicadores = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProfessor } = useRole();
  const { isProcessing, runWithLoader } = useProcessing();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

  /* ── Tabla Rentabilidad → result.indRentabilidad ── */
  const estructuraRentabilidad = [
    {
      label: "Margen Bruto",
      formula: "Resultado Bruto / Ventas",
      path: ["indRentabilidad", "margenBruto", "resultBrutoVentas"],
      format: "percent",
    },
    {
      label: "Margen Operacional",
      formula: "Resultado Operacional / Ventas",
      path: ["indRentabilidad", "margenOperacional", "resultOperacionalVentas"],
      format: "percent",
    },
    {
      label: "Margen Neto de Utilidad",
      formula: "Resultado del ejercicio / Ventas",
      path: ["indRentabilidad", "margenNetoUtilidad", "resultEjercicioVentas"],
      format: "percent",
    },
    {
      label: "Rendimiento del Patrimonio",
      formula: "Resultado del ejercicio / Patrimonio",
      path: ["indRentabilidad", "rendPatrimonio", "resultEjercicioPatri"],
      format: "percent",
    },
    {
      label: "Rendimiento del Activo",
      formula: "Resultado del ejercicio / Activo Total",
      path: ["indRentabilidad", "rendDelActivo", "resultEjercicioActivoTotal"],
      format: "percent",
    },
  ];

  /* ── Tabla Generación de Valor → result.indGeneracionValor ── */
  const estructuraGeneracion = [
    {
      label: "KTNO",
      formula: "C x C + Inventarios - C x P",
      path: ["indGeneracionValor", "ktno", "ccInventariosCp"],
      format: "currency",
    },
    {
      label: "PKT",
      formula: "KTNO / Ingresos",
      path: ["indGeneracionValor", "pkt", "ktnoIngresos"],
      format: "percent",
    },
    {
      label: "ROA (Rendimiento Activo)",
      formula: "UAII / Activos Netos Operativos",
      path: ["indGeneracionValor", "roa", "uaiiActNetosOper"],
      format: "percent",
    },
    {
      label: "ROI (Rendimiento Patrimonio)",
      formula: "UAI / Patrimonio",
      path: ["indGeneracionValor", "roi", "uaiPatrimonio"],
      format: "percent",
    },
    {
      label: "Margen EBITDA",
      formula: "EBITDA / Ingresos",
      path: ["indGeneracionValor", "margenEbitda", "ebitdaIngresos"],
      format: "percent",
    },
    {
      label: "Costo Promedio Ponderado",
      formula: "—",
      path: ["indGeneracionValor", "costoPromPonderado", "costPromedioPonderado"],
      format: "percent",
    },
    {
      label: "RAN",
      formula: "UODI / Activos de Operación",
      path: ["indGeneracionValor", "ran", "uodiActOper"],
      format: "percent",
    },
    {
      label: "EVA",
      formula: "UODI - Activos x CK",
      path: ["indGeneracionValor", "eva", "uodiActivosCk"],
      format: "currency",
    },
    {
      label: "EVA",
      formula: "Activos x (RAN - CK)",
      path: ["indGeneracionValor", "eva2", "activosRanCk"],
      format: "currency",
    },
    {
      label: "% EVA",
      formula: "EVA / Ventas",
      path: ["indGeneracionValor", "porcentEva", "evaVentas"],
      format: "percent",
    },
  ];

  const [valores, setValores] = useState({});
  const [analisis, setAnalisis] = useState("");
  const [allComments, setAllComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const savedComment = useRef("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (resultadosCalculados && Object.keys(resultadosCalculados).length > 0) {
          setValores(resultadosCalculados.result);
        }
        const data = await axiosClient.getResults(projectId);
        setValores(data.result);
        setAllComments(data.comments || {});
        setAnalisis(data.comments?.indicadores || "");
        savedComment.current = data.comments?.indicadores || "";
      } catch (error) {
        console.error("❌ Error cargando Indicadores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (isProfessor) return;
    if (analisis === savedComment.current) {
      toast.success("No hay cambios que guardar.");
      return;
    }
    try {
      await axiosClient.saveComment(projectId, "indicadores", analisis);
      savedComment.current = analisis;
      toast.success("Comentario guardado correctamente.");
    } catch (error) {
      toast.error("Error al guardar el comentario.");
    }
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "";
    const absValue = Math.abs(value);
    const decimalsNeeded = absValue % 1 === 0 ? 0 : absValue * 10 % 1 === 0 ? 1 : 2;
    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: decimalsNeeded,
      maximumFractionDigits: decimalsNeeded,
    });
  };

  const formatPercent = (value) => {
    if (value == null || isNaN(value)) return "";
    const pct = value * 100;
    const decimalsNeeded = pct % 1 === 0 ? 0 : pct * 10 % 1 === 0 ? 1 : 2;
    return `${pct.toFixed(decimalsNeeded)}%`;
  };

  const formatDecimal = (value) => {
    if (value == null || isNaN(value)) return "";
    const decimalsNeeded = value % 1 === 0 ? 0 : value * 10 % 1 === 0 ? 1 : 2;
    return value.toFixed(decimalsNeeded);
  };

  const getCellValue = (pathArray, colIndex) => {
    let current = valores;
    for (const key of pathArray) {
      if (current == null) return null;
      current = current[key];
    }
    if (current == null) return null;

    if (!Array.isArray(current)) {
      return colIndex === 0 ? current : null;
    }

    const len = current.length;
    if (len >= 5) return current[colIndex] ?? null;
    if (len === 4) return colIndex === 0 ? null : (current[colIndex - 1] ?? null);
    return current[colIndex] ?? null;
  };

  const formatValue = (value, format) => {
    if (value == null) return "";
    if (format === "currency") return formatCurrency(value);
    if (format === "percent") return formatPercent(value);
    return formatDecimal(value);
  };

  return (
    <div className="project-info-container">
      {isProcessing && <CeipaLoader />}
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-wacc">
          <img src={tituloIndicadores} alt="Indicadores" className="robot-img-ind" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Los indicadores financieros son herramientas cuantitativas, como ratios o métricas, que se derivan de los estados financieros para medir y evaluar la salud, el rendimiento y la posición financiera de una empresa en un periodo específico. Permiten a directivos, inversionistas y otros interesados tomar decisiones informadas al analizar la liquidez, solvencia, rentabilidad y eficiencia de la organización, comparando su desempeño con su historial o con el de otras empresas del sector.
            </p>

            {/* Tabla Rentabilidad */}
            <div className="estado-tabla-container">
              <img src={tituloRentabilidad} alt="Indicadores de rentabilidad" className="robot-tit-in" />
              <table className="estado-tabla-in">
                <thead>
                  <tr className="fila-titulo-seccion">
                    <td>Indicadores de Rentabilidad</td>
                    <td>Fórmula de cálculo</td>
                    {anios.map((anio) => (
                      <td key={anio}>{anio}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estructuraRentabilidad.map((item, idx) => (
                    <tr key={idx}>
                      <td className="estado-concepto">{item.label}</td>
                      <td className="estado-concepto">{item.formula}</td>
                      {anios.map((anio, colIndex) => {
                        const val = getCellValue(item.path, colIndex);
                        return (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {formatValue(val, item.format)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla Generación de Valor */}
            <div className="estado-tabla-container">
              <img src={tituloGeneracion} alt="Indicadores de generación de valor" className="robot-tit-in" />
              <table className="estado-tabla-in">
                <thead>
                  <tr className="fila-titulo-seccion">
                    <td>Indicadores de Valor</td>
                    <td>Fórmula de cálculo</td>
                    {anios.map((anio) => (
                      <td key={anio}>{anio}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estructuraGeneracion.map((item, idx) => (
                    <tr key={`gen-${idx}`}>
                      <td className="estado-concepto">{item.label}</td>
                      <td className="estado-concepto">{item.formula}</td>
                      {anios.map((anio, colIndex) => {
                        const val = getCellValue(item.path, colIndex);
                        return (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {formatValue(val, item.format)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comentarios */}
            <div className="estado-analisis-container">
              <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
              <textarea
                id="ana-indicadores"
                rows={10}
                className="estado-textarea"
                placeholder="Escribe aquí tu análisis..."
                value={analisis}
                onChange={(e) => setAnalisis(e.target.value)}
                  readOnly={isProfessor}
                  style={{ backgroundColor: isProfessor ? "#f9f9f9" : "white" }}
              />
            </div>

            {/* Guardar */}
            {!isProfessor && (
              <div className="guardar-avance-wrapper">
                <button type="submit" className="guardar-avance-container">
                  <span className="guardar-avance-texto">
                    <strong>Antes de seguir</strong>, asegúrate de guardar tu progreso. Haz clic aquí para no perder tu avance.
                  </span>
                  <div className="guardar-avance-icono"><DownloadCloud size={24} /></div>
                </button>
              </div>
            )}

            {/* Navegación */}
            <div className="buttons-container">
              <button className="nav-btn anterior" type="button" onClick={() => navigate(-1)}>&lt; Anterior</button>
              <button
                className="procesar"
                type="button"
                onClick={async () => {
                  const toastId = toast.loading("Generando reporte PDF...");
                  try {
                    await axiosClient.downloadReport(projectId);
                    toast.success("Reporte descargado.", { id: toastId });
                  } catch (error) {
                    toast.error("Error al generar el reporte.", { id: toastId });
                  }
                }}
              >
                <FileDown size={18} style={{ marginRight: '6px' }} />
                Generar Reporte
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Indicadores;
