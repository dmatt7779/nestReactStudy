import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloEstadoSituaFin from "../../images/titulo_estado_financiera.png";
import tituloActivos from "../../images/activos.png";
import tituloPasivos from "../../images/pasivos.png";
import tituloPatrimonio from "../../images/patrimonio.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";
import { useRole } from "../../hooks/useRole";

const EstadoSituaFin = () => {
  const navigate = useNavigate();
  const { isProfessor } = useRole();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  // 6 columnas: Inicio YEAR, YEAR, YEAR+1, YEAR+2, YEAR+3, YEAR+4
  const anios = [`Inicio ${openingYear}`, ...Array.from({ length: 5 }, (_, i) => openingYear + i)];

  // Mapeo: section = sub-objeto dentro de EstadoSituacionFinanc, field = campo
  // section null = campo directo en la raíz de EstadoSituacionFinanc
  const estructura = [
    { tipo: "titulo", titulo: "Activos corrientes" },
    { tipo: "separador" },
    { label: "Disponible",                     section: "activosCorrientes", field: "esfDisponible" },
    { label: "Inversiones temporales",         section: "activosCorrientes", field: "esfInversionesTemporales" },
    { label: "Deudores (cuentas por cobrar)",  section: "activosCorrientes", field: "esfPorCobrar" },
    { label: "Inventarios",                    section: "activosCorrientes", field: "esfInventarios" },
    { label: "Otros activos",                  section: "activosCorrientes", field: "esfOtrosActivos" },
    { label: "Total activo corriente",         section: "activosCorrientes", field: "esfTotalActivosCorrientes", dark: true },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Activos de largo plazo" },
    { tipo: "separador" },
    { label: "Muebles y enseres",              section: "activosLargoPlazo", field: "mueblesEnseres" },
    { label: "Maquinaria y equipo",            section: "activosLargoPlazo", field: "equipoMaquinaria" },
    { label: "Vehículos",                      section: "activosLargoPlazo", field: "vehiculos" },
    { label: "Terrenos",                       section: "activosLargoPlazo", field: "terrenos" },
    { label: "Edificaciones",                  section: "activosLargoPlazo", field: "edificaciones" },
    { label: "Equipo de computación",          section: "activosLargoPlazo", field: "equiposComputo" },
    { label: "Depreciación acumulada",         section: "activosLargoPlazo", field: "depreciacionAcumulada" },
    { label: "Activos Diferidos",              section: "activosLargoPlazo", field: "activosDiferidos" },
    { label: "Amortización acumulada",         section: "activosLargoPlazo", field: "amortizacionAcumulada" },
    { label: "Total activos NO corrientes",    section: "activosLargoPlazo", field: "totalActivosNoCorrientes", dark: true },
    { tipo: "separador" },

    { label: "Total activos",                  section: null, field: "totalActivos", dark: true, blue: true },

    { tipo: "titulo", titulo: "Pasivos corrientes" },
    { label: "Proveedores",                    section: "pasivosCorrientes", field: "proveedores" },
    { label: "Impuesto por pagar",             section: "pasivosCorrientes", field: "impuestosPorPagar" },
    { label: "Cuenta por Pagar a Socios 1er año", section: "pasivosCorrientes", field: "pagarSociosAno1" },
    { label: "Cuenta por Pagar a Socios",      section: "pasivosCorrientes", field: "pagarSocios" },
    { label: "Obligaciones financieras corrientes", section: "pasivosCorrientes", field: "obligacionesFinancierasCor" },
    { label: "Total pasivos corrientes",       section: "pasivosCorrientes", field: "totalPasivosCorrientes", dark: true },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Pasivos no corrientes" },
    { tipo: "separador" },
    { label: "Obligaciones financieras no corrientes", section: "pasivosNoCorrientes", field: "obligacionesFinancierasNoCor" },
    { tipo: "separador" },
    { label: "Total pasivos NO corrientes",    section: "pasivosNoCorrientes", field: "totalPasivosNoCorrientes", dark: true },
    { tipo: "separador" },

    { label: "Total pasivos",                  section: null, field: "totalPasivos", dark: true, blue: true },

    { tipo: "titulo", titulo: "Patrimonio" },
    { label: "Capital",                        section: "patrimonio", field: "capital" },
    { label: "Capital ADICIONAL por parte de Socios", section: "patrimonio", field: "esfCapitalAdicionalSocios" },
    { label: "Reserva Legal",                  section: "patrimonio", field: "reservaLegal" },
    { label: "Utilidades retenidas",           section: "patrimonio", field: "utilidadRetenidas" },
    { label: "Utilidad del periodo",           section: "patrimonio", field: "utilidadPeriodo" },
    { label: "Total patrimonio",               section: null, field: "totalPatrimonio", dark: true },
    { tipo: "separador" },

    { label: "Total pasivo y patrimonio",      section: null, field: "totalPasivosPatrimonio", dark: true, blue: true },
    { tipo: "separador" },

    { label: "Decisión Junta Directiva",       section: null, field: "decisionJuntaDirectiva", red: true },
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
        setAnalisis(data.comments?.estadoSituacionFinanc || "");
        savedComment.current = data.comments?.estadoSituacionFinanc || "";
      } catch (error) {
        console.error("❌ Error cargando estado situación financiera:", error);
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
      await axiosClient.saveComment(projectId, "estadoSituacionFinanc", analisis);
      savedComment.current = analisis;
      toast.success("Comentario guardado correctamente.");
    } catch (error) {
      toast.error("Error al guardar el comentario.");
    }
  };

  // Formatea un número como moneda COP con máximo 2 decimales
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

  // Obtiene el valor para una fila y una columna (índice)
  const getCellValue = (item, colIndex) => {
    const esf = valores.EstadoSituacionFinanc;
    if (!esf) return null;

    const rawData = item.section
      ? esf[item.section]?.[item.field]
      : esf[item.field];

    if (rawData == null) return null;

    // Escalar: solo en la primera columna (Inicio)
    if (!Array.isArray(rawData)) {
      return colIndex === 0 ? rawData : null;
    }

    // Arrays según su longitud
    const len = rawData.length;
    if (len === 6) {
      return rawData[colIndex] ?? null;
    } else if (len === 5) {
      return colIndex === 0 ? null : (rawData[colIndex - 1] ?? null);
    } else if (len === 4) {
      return colIndex <= 1 ? null : (rawData[colIndex - 2] ?? null);
    }
    return rawData[colIndex] ?? null;
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={tituloEstadoSituaFin} alt="Estado Financiero" className="robot-img-es-si" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              El estado de situación financiera, también llamado balance general, es un informe contable que muestra los activos (bienes y derechos), pasivos (obligaciones y deudas) y el patrimonio (capital) de una entidad en un momento específico, actuando como una "fotografía" de su situación económica para evaluar su liquidez y solvencia.
            </p>

            <div className="container-titulo">
              <img src={tituloActivos} alt="Estado Financiero" className="titulo-img-es-si" />
            </div>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.field || `row-${i}`}>
                      {item.titulo === "Pasivos corrientes" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="fila-imagen-centro">
                            <img src={tituloPasivos} alt="Imagen Pasivos" className="titulo-img-es-si" />
                          </td>
                        </tr>
                      )}

                      {item.titulo === "Patrimonio" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="fila-imagen-centro">
                            <img
                              src={tituloPatrimonio}
                              alt="Imagen Patrimonio"
                              className="titulo-img-es-si"
                            />
                          </td>
                        </tr>
                      )}

                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          {[
                            "Activos corrientes",
                            "Activos de largo plazo",
                            "Pasivos corrientes",
                            "Pasivos no corrientes",
                            "Patrimonio",
                          ].includes(item.titulo) ? (
                            <>
                              <td className="estado-concepto fila-aporte-adicional">{item.titulo}</td>
                              {anios.map((anio, index) => (
                                <td key={index} className="estado-celda anio-celda">
                                  {anio}
                                </td>
                              ))}
                            </>
                          ) : (
                            <td
                              colSpan={anios.length + 1}
                              className="estado-concepto fila-aporte-adicional"
                            >
                              {item.titulo}
                            </td>
                          )}
                        </tr>
                      )}

                      {item.field && (
                        <tr
                          className={`estado-fila 
                            ${item.dark ? "fila-gray" : ""} 
                            ${item.blue ? "fila-blue" : ""} 
                            ${item.red ? "fila-decision-roja" : ""}
                          `}
                        >
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio, colIndex) => {
                            const val = getCellValue(item, colIndex);
                            return (
                              <td key={colIndex} className="estado-celda-gray">
                                <span className="estado-dato">
                                  {val != null ? formatCurrency(val) : ""}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      )}

                      {item.field === "decisionJuntaDirectiva" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="mensaje-explicacion">
                            En caso de que se presente un monto en la "Decisión Junta Directiva",
                            se deberá explicar las razones de esta cifra y plantear una solución
                            financiera.
                          </td>
                        </tr>
                      )}

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
                <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
                <textarea
                  id="ana-estado-situacion"
                  rows={10}
                  className="estado-textarea"
                  placeholder="Escribe aquí tu análisis..."
                  value={analisis}
                  onChange={(e) => setAnalisis(e.target.value)}
                  readOnly={isProfessor}
                  style={{ backgroundColor: isProfessor ? "#f9f9f9" : "white" }}
                />
              </div>
            </div>

            {!isProfessor && (
              <div className="guardar-avance-wrapper">
              <button type="submit" className="guardar-avance-container">
                <span className="guardar-avance-texto">
                  <strong>Antes de seguir</strong>, asegúrate de guardar tu progreso. Haz clic aquí
                  para no perder tu avance.
                </span>
                <div className="guardar-avance-icono">
                  <DownloadCloud size={24} />
                </div>
              </button>
            </div>
            )}

            <div className="buttons-container">
              <button
                className="nav-btn anterior"
                type="button"
                onClick={() => navigate(-1)}
              >&lt; Anterior</button>
              <button
                className="nav-btn siguiente"
                type="button"
                onClick={async () => {
                  const updatedComments = { ...allComments, estadoSituacionFinanc: analisis };
                  if (!isProfessor && analisis !== savedComment.current) {
                    try { await axiosClient.saveComment(projectId, "estadoSituacionFinanc", analisis); } catch(e) {}
                  }
                  navigate("/flujoCaja", {
                    state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores, comments: updatedComments } : null }
                  });
                }}
              >{isProfessor ? 'Continuar >' : 'Guardar y continuar >'}</button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EstadoSituaFin;
