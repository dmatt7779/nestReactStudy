import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloWacc from "../../images/titulo_wacc.png";
import tituloMedia from "../../images/titulo_media.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";

const Wacc = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

  const estructuraPasivoPatrimonio = [
    { label: "Proveedores",                              field: "waccProveedores" },
    { label: "Impuesto por pagar",                       field: "waccImpPagar" },
    { label: "Obligaciones financieras corrientes",      field: "waccOblFinanCorrientes" },
    { label: "Obligaciones financieras NO corrientes",   field: "waccOblFinanNoCorrientes" },
    { label: "Patrimonio",                               field: "waccPatrimonio" },
    { label: "Total pasivo y patrimonio",                field: "waccTotalPasivoPatrimonio", dark: true },
  ];

  const estructuraParticipacion = [
    { label: "Proveedores",                              field: "waccPartProveedores" },
    { label: "Impuesto por pagar",                       field: "waccImpPorPagar" },
    { label: "Obligaciones financieras corrientes",      field: "waccPartOblFinanCorrientes" },
    { label: "Obligaciones financieras NO corrientes",   field: "waccPartOblFinanNoCorrientes" },
    { label: "Patrimonio",                               field: "waccPartPatrimonio" },
    { label: "Costo promedio ponderado",                 field: "waccCostoPromPonderado", dark: true },
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
        setAnalisis(data.comments?.wacc || "");
        savedComment.current = data.comments?.wacc || "";
      } catch (error) {
        console.error("❌ Error cargando WACC:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (analisis === savedComment.current) {
      toast.success("No hay cambios que guardar.");
      return;
    }
    try {
      await axiosClient.saveComment(projectId, "wacc", analisis);
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

  const getCellValue = (source, fieldName, colIndex) => {
    if (!source) return null;
    const rawData = source[fieldName];
    if (rawData == null) return null;

    if (!Array.isArray(rawData)) {
      return colIndex === 0 ? rawData : null;
    }

    const len = rawData.length;
    if (len >= 5) return rawData[colIndex] ?? null;
    if (len === 4) return colIndex === 0 ? null : (rawData[colIndex - 1] ?? null);
    return rawData[colIndex] ?? null;
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-wacc">
          <img src={tituloWacc} alt="Wacc" className="robot-img-wacc" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Este flujo de caja refleja las operaciones, decisiones de inversión y financiación de la empresa.
              Los valores son obtenidos de la base de datos para cada año.
            </p>

            {/* Tabla Pasivo y Patrimonio */}
            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <thead>
                  <tr className="fila-titulo-seccion">
                    <td></td>
                    {anios.map((anio) => (
                      <td key={anio}>{anio}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estructuraPasivoPatrimonio.map((item, idx) => (
                    <tr key={idx} className={item.dark ? "fila-gray" : ""}>
                      <td className="estado-concepto">{item.label}</td>
                      {anios.map((anio, colIndex) => {
                        const val = getCellValue(valores.wacc, item.field, colIndex);
                        return (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {val != null ? formatCurrency(val) : ""}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla Participación */}
            <div className="estado-tabla-container">
              <div className="subtitulo-tabla">Participación</div>
              <table className="estado-tabla-wacc">
                <tbody>
                  {estructuraParticipacion.map((item, idx) => (
                    <tr key={idx} className={item.dark ? "fila-gray" : ""}>
                      <td className="estado-concepto">{item.label}</td>
                      {anios.map((anio, colIndex) => {
                        const val = getCellValue(valores.wacc?.participacion, item.field, colIndex);
                        return (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {val != null ? formatPercent(val) : ""}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bloque Media aritmética */}
            <img src={tituloMedia} alt="Media aritmética" className="robot-tit-wacc" />
            <div className="bloque-tasas">
              <table className="tabla-tasas">
                <tbody>
                  <tr>
                    <td className="celda-azul">Costo promedio ponderado</td>
                    <td className="celda-naranja">
                      {valores.wacc?.participacion?.waccCostoPromPonderado
                        ? formatPercent(
                            valores.wacc.participacion.waccCostoPromPonderado
                              .filter((v) => v != null && !isNaN(v))
                              .reduce((sum, v, _, arr) => sum + v / arr.length, 0)
                          )
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comentarios */}
            <div className="estado-analisis-container">
              <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
              <textarea
                id="ana-wacc"
                rows={10}
                className="estado-textarea"
                placeholder="Escribe aquí tu análisis..."
                value={analisis}
                onChange={(e) => setAnalisis(e.target.value)}
              />
            </div>

            {/* Guardar */}
            <div className="guardar-avance-wrapper">
              <button type="submit" className="guardar-avance-container">
                <span className="guardar-avance-texto">
                  <strong>Antes de seguir</strong>, asegúrate de guardar tu progreso. Haz clic aquí para no perder tu avance.
                </span>
                <div className="guardar-avance-icono"><DownloadCloud size={24} /></div>
              </button>
            </div>

            {/* Navegación */}
            <div className="buttons-container">
              <button className="nav-btn anterior" type="button" onClick={() => navigate(-1)}></button>
              <button className="nav-btn siguiente" type="button" onClick={async () => {
                const updatedComments = { ...allComments, wacc: analisis };
                if (analisis !== savedComment.current) {
                  try { await axiosClient.saveComment(projectId, "wacc", analisis); } catch(e) {}
                }
                navigate("/indiFinancieros", {
                  state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores, comments: updatedComments } : null }
                });
              }}></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Wacc;
