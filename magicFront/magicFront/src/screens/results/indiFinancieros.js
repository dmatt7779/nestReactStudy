import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloIndiFinancieros from "../../images/titulo_indicadores_liquidez_actividades.png"; 
import tituloIndiLiq from "../../images/indi_fi_liq.png"; 
import tituloIndiEnd from "../../images/indi_fi_end.png"; 
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";
import { useRole } from "../../hooks/useRole";

const IndiFinancieros = () => {
  const navigate = useNavigate();
  const { isProfessor } = useRole();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

  const estructuraLiquidez = [
    {
      label: "Razón Corriente",
      formula: "Activo corriente / Pasivo corriente",
      path: ["indLiquidez", "razonCorriente", "ilActPasCorriente"],
      format: "decimal",
    },
    {
      label: "Solidez",
      formula: "Activo total / Pasivo total",
      path: ["indLiquidez", "solidez", "ilActPasTotal"],
      format: "decimal",
    },
    {
      label: "Capital de Trabajo",
      formula: "Activo corriente - Pasivo CTE",
      path: ["indLiquidez", "capitalTrabajo", "ilActCtePasCte"],
      format: "currency",
    },
  ];

  const estructuraEndeudamiento = [
    {
      label: "Índice de endeudamiento",
      formula: "Pasivo total / Activo total",
      path: ["indEndeudamiento", "endeudamiento", "endActPasTotal"],
      format: "percent",
    },
    {
      label: "Endeudamiento a corto plazo",
      formula: "Pasivo corriente / (Pasivo total + Activo total)",
      path: ["indEndeudamiento", "endCortoPlazo", "endPasCtePasTotal"],
      format: "percent",
    },
    {
      label: "Patrimonio a pasivos",
      formula: "Patrimonio / Pasivo total",
      path: ["indEndeudamiento", "patrimonioAPasivos", "endPatriPasTotal"],
      format: "decimal",
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
        setAnalisis(data.comments?.indiFinancieros || "");
        savedComment.current = data.comments?.indiFinancieros || "";
      } catch (error) {
        console.error("❌ Error cargando Indicadores Financieros:", error);
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
      await axiosClient.saveComment(projectId, "indiFinancieros", analisis);
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
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-wacc">
          <img src={tituloIndiFinancieros} alt="Indicadores Financieros" className="robot-img-in" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">

            {/* Tabla Liquidez y Actividad */}
            <div className="estado-tabla-container">
              <img src={tituloIndiLiq} alt="Indicadores de Liquidez y Actividad" className="robot-tit-in" />
              <table className="estado-tabla-in">
                <thead>
                  <tr className="fila-titulo-seccion">
                    <td>Liquidez</td>
                    <td>Fórmula de cálculo</td>
                    {anios.map((anio) => (
                      <td key={anio}>{anio}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estructuraLiquidez.map((item, idx) => (
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

            {/* Tabla Endeudamiento */}
            <div className="estado-tabla-container">
              <img src={tituloIndiEnd} alt="Indicadores de Endeudamiento" className="robot-tit-in" />
              <table className="estado-tabla-in">
                <thead>
                  <tr className="fila-titulo-seccion">
                    <td>Endeudamiento</td>
                    <td>Fórmula de cálculo</td>
                    {anios.map((anio) => (
                      <td key={anio}>{anio}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estructuraEndeudamiento.map((item, idx) => (
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
              <button className="nav-btn siguiente" type="button" onClick={async () => {
                const updatedComments = { ...allComments, indiFinancieros: analisis };
                if (!isProfessor && analisis !== savedComment.current) {
                  try { await axiosClient.saveComment(projectId, "indiFinancieros", analisis); } catch(e) {}
                }
                navigate("/indicadores", {
                  state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores, comments: updatedComments } : null }
                });
              }}>{isProfessor ? 'Continuar >' : 'Guardar y continuar >'}</button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default IndiFinancieros;
