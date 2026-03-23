import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloFlujoCaja from "../../images/titulo_flujo_caja.png";
import tituloPuntoEqu from "../../images/punto_equ.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";
import { useRole } from "../../hooks/useRole";

const FlujoCaja = () => {
  const navigate = useNavigate();
  const { isProfessor } = useRole();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

  
  const estructura = [
    { tipo: "titulo", titulo: "Concepto" },
    { tipo: "separador" },
    { label: "Ventas",                                      field: "fujVentas" },
    { label: "Costos",                                      field: "fujCostos" },
    { label: "Gastos operativos",                           field: "fujGastosOperativos" },
    { tipo: "separador" },
    { label: "Utilidad operativa",                          field: "fujUtilidadOperativa", dark: true },
    { tipo: "separador" },
    { label: "Impuesto de renta operativo",                 field: "fujImpRentaOperativo" },
    { label: "Beneficio fiscal financiero",                 field: "fujBeneficioFiscal" },
    { tipo: "separador" },
    { label: "Utilidad operativa después de impuestos",     field: "fujUtilOperDespuesImpuesto", dark: true },
    { tipo: "separador" },
    { label: "Depreciación y amortización",                 field: "fujDepresiacionAmort" },
    { tipo: "separador" },
    { label: "Flujo de caja bruto operativo",               field: "fujCajaBrutoOperativo", dark: true, hasExtraCol: true },
    { tipo: "separador" },
    { tipo: "indicadores_proyecto" }, 
    { tipo: "separador" },
    { label: "Capital neto de trabajo (KTNO)",              field: "capitalNetoKtno" },
    { label: "Escudo fiscal",                               field: "escudoFiscal" },
    { label: "Servicio de la deuda",                        field: "fujServicioDeuda" },
    { label: "Gastos financieros",                          field: "fujGastosFinancieros" },
    { label: "Aporte inicial de socios",                    field: "fujAportInicialSocios" },
    { label: "Aporte adicional de socios",                  field: "fujAporteAdicionalSocios" },
    { label: "Cuenta por pagar a socios",                   field: "fujCuentaPagarSocios" },
    { tipo: "separador" },
    { label: "Flujo de caja libre inversionista",           field: "flujoCajaLibreInver", dark: true, hasExtraCol: true },
    { tipo: "separador" },
    { tipo: "tir_inversionista" }, 
    { tipo: "separador" },
    { tipo: "punto_equilibrio" },
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
        setAnalisis(data.comments?.flujoCaja || "");
        savedComment.current = data.comments?.flujoCaja || "";
      } catch (error) {
        console.error("❌ Error cargando flujo de caja:", error);
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
      await axiosClient.saveComment(projectId, "flujoCaja", analisis);
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
    if (value == null || isNaN(value)) return "N/A";
    const pct = value * 100;
    const decimalsNeeded = pct % 1 === 0 ? 0 : pct * 10 % 1 === 0 ? 1 : 2;
    return `${pct.toFixed(decimalsNeeded)}%`;
  };

  
  const getCellValue = (fieldName, colIndex) => {
    const fc = valores.flujoCaja;
    if (!fc) return null;

    const rawData = fc[fieldName];
    if (rawData == null) return null;

    
    if (!Array.isArray(rawData)) {
      return colIndex === 0 ? rawData : null;
    }

    const len = rawData.length;
    
    if (len >= 5) return rawData[colIndex] ?? null;
    
    if (len === 4) return colIndex === 0 ? null : (rawData[colIndex - 1] ?? null);
    return rawData[colIndex] ?? null;
  };

  
  const getScalar = (fieldName) => {
    return valores.flujoCaja?.[fieldName] ?? null;
  };

  
  const formatTirValue = (value, type) => {
    if (value == null || typeof value === "string") return value == null ? "N/A" : value;
    return type === "percent" ? formatPercent(value) : formatCurrency(value);
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={tituloFlujoCaja} alt="Flujo de Caja" className="robot-img-fl-ca" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Este flujo de caja refleja las operaciones, decisiones de inversión y financiación de la empresa.
              Completa los valores para cada año y revisa los indicadores al final.
            </p>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.field || `row-${i}`}>
                      {/* TITULO DE SECCIÓN */}
                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          <td colSpan={2} className="estado-concepto fila-aporte-adicional">{item.titulo}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda">{anio}</td>
                          ))}
                        </tr>
                      )}

                      {/* FILAS DE DATOS */}
                      {item.field && (
                        <tr className={`estado-fila ${item.dark ? "fila-gray" : ""}`}>
                          <td colSpan={item.hasExtraCol ? 1 : 2} className="estado-concepto">{item.label}</td>
                          {/* Celda extra para arrays de 6 posiciones (ej: fujCajaBrutoOperativo) */}
                          {item.hasExtraCol && (
                            <td className="estado-celda">
                              <span className="estado-dato">
                                {valores.flujoCaja?.[item.field]?.[0] != null
                                  ? formatCurrency(valores.flujoCaja[item.field][0])
                                  : ""}
                              </span>
                            </td>
                          )}
                          {anios.map((anio, colIndex) => {
                            const idx = item.hasExtraCol ? colIndex + 1 : colIndex;
                            const val = item.hasExtraCol
                              ? (valores.flujoCaja?.[item.field]?.[idx] ?? null)
                              : getCellValue(item.field, colIndex);
                            return (
                              <td key={anio} className="estado-celda">
                                <span className="estado-dato">
                                  {val != null ? formatCurrency(val) : ""}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      )}

                      {/* BLOQUE INDICADORES DEL PROYECTO */}
                      {item.tipo === "indicadores_proyecto" && (
                        <tr>
                          <td colSpan={anios.length + 2}>
                            <div className="indicadores-wrapper">
                              <table className="indicadores-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <tbody>
                                  <tr className="indicador-row">
                                    <td className="estado-concepto celda-titulo-azul">TIR del proyecto</td>
                                    <td className="estado-celda">{formatTirValue(getScalar("tirProyecto"), "percent")}</td>
                                    <td className="estado-celda-f"><span className="form-help">▶ Mayor que la TMRR</span></td>
                                  </tr>
                                  <tr className="indicador-row">
                                    <td className="estado-concepto celda-titulo-azul">TMRR o COK</td>
                                    <td className="estado-celda">{formatTirValue(getScalar("tmrrCok"), "percent")}</td>
                                    <td className="estado-celda-f"><span className="form-help">▶ Tasa mínima de retorno requerida</span></td>
                                  </tr>
                                  <tr className="indicador-row">
                                    <td className="estado-concepto celda-titulo-azul">TIR modificada del proyecto</td>
                                    <td className="estado-celda">{formatTirValue(getScalar("tirModificado"), "percent")}</td>
                                    <td className="estado-celda-f"><span className="form-help">▶ Mayor a la TMRR</span></td>
                                  </tr>
                                  <tr className="indicador-row">
                                    <td className="estado-concepto celda-titulo-azul">VPN del proyecto (TMRR)</td>
                                    <td className="estado-celda">{formatTirValue(getScalar("vpnProyectoTmrr"), "currency")}</td>
                                    <td className="estado-celda-f"><span className="form-help">▶ Mayor a cero</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* BLOQUE TIR INVERSIONISTA */}
                      {item.tipo === "tir_inversionista" && (
                        <tr>
                          <td colSpan={anios.length + 2}>
                            <div className="bloque-inversionista">
                              <table className="tabla-inversionista">
                                <thead>
                                  <tr>
                                    <th className="celda-titulo-azul">TIR del inversionista</th>
                                    <th className="celda-titulo-azul">TMRR</th>
                                    <th className="celda-titulo-azul">TIR modificada del inversionista</th>
                                    <th className="celda-titulo-azul">VPN</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="celda-valor">{formatTirValue(getScalar("tirInversionista"), "percent")}</td>
                                    <td className="celda-valor">{formatTirValue(getScalar("fujTmrr"), "percent")}</td>
                                    <td className="celda-valor">{formatTirValue(getScalar("fujTirModificadaInver"), "percent")}</td>
                                    <td className="celda-valor">{formatTirValue(getScalar("fujVpn"), "currency")}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* BLOQUE PUNTO DE EQUILIBRIO */}
                      {item.tipo === "punto_equilibrio" && valores.flujoCaja?.puntoEquilibrio && (
                        <tr>
                          <td colSpan={anios.length + 2}>
                            <div className="bloque-punto-equilibrio">
                              <div className="fila-imagen-centro">
                                <img src={tituloPuntoEqu} alt="Punto de Equilibrio" className="titulo-img-es-si" />
                              </div>
                              <table className="tabla-pe">
                                <thead>
                                  <tr>
                                    <th className="celda-titulo-naranja">Punto de Equilibrio</th>
                                    <th className="celda-titulo-naranja">{openingYear}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>En unidades (costos fijos / PVU - CVU) Anual</td>
                                    <td>{formatCurrency(valores.flujoCaja.puntoEquilibrio?.unidadesAnual)}</td>
                                  </tr>
                                  <tr>
                                    <td>En unidades (costos fijos / PVU - CVU) Mensual</td>
                                    <td>{formatCurrency(valores.flujoCaja.puntoEquilibrio?.unidadesMensual)}</td>
                                  </tr>
                                  <tr>
                                    <td>En pesos (costos fijos / 1 - MCU) Anual</td>
                                    <td>{formatCurrency(valores.flujoCaja.puntoEquilibrio?.pesosAnual)}</td>
                                  </tr>
                                  <tr>
                                    <td>En pesos (costos fijos / 1 - MCU) Mensual</td>
                                    <td>{formatCurrency(valores.flujoCaja.puntoEquilibrio?.pesosMensual)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* SEPARADOR */}
                      {item.tipo === "separador" && (
                        <tr><td colSpan={anios.length + 2} className="empty-row"></td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comentarios */}
            <div className="estado-analisis-container">
              <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
              <textarea
                id="ana-flujo-caja"
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
                const updatedComments = { ...allComments, flujoCaja: analisis };
                if (!isProfessor && analisis !== savedComment.current) {
                  try { await axiosClient.saveComment(projectId, "flujoCaja", analisis); } catch(e) {}
                }
                navigate("/wacc", {
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

export default FlujoCaja;
