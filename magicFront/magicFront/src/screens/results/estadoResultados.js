import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloEstadoResultados from "../../images/titulo_estado_resultado.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";
import toast from "react-hot-toast";

const EstadoResultados = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = location.state?.projectId || sessionStorage.getItem("currentProjectId");
  const openingYear = location.state?.openingYear || new Date().getFullYear();
  const resultadosCalculados = location.state?.resultadosCalculados || null;

  const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

  const conceptos = [
    { label: "Ventas", key: "ventas" },
    { label: "Costos de ventas", key: "costosVentas" },
    { label: "Utilidad bruta", key: "utilidadBruta", bold: true },
    { label: "Gastos operativos", key: "gastosOperativos" },
    { label: "Utilidad antes impuestos e intereses", key: "utilidadAntesImpInt", bold: true },
    { label: "Gastos financieros", key: "gastosFinancieros" },
    { label: "Ingresos financieros", key: "ingresosFinancieros" },
    { label: "Utilidad antes de impuestos", key: "utilidadAntesImp", bold: true },
    { label: "Impuestos", key: "impuestos" },
    { label: "Utilidad neta", key: "utilidadNeta", bold: true, black: true },
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
        // Set result from navigation state for instant table render
        if (resultadosCalculados && Object.keys(resultadosCalculados).length > 0) {
          setValores(resultadosCalculados.result);
        }
        // Always fetch from DB to get the latest comments
        const data = await axiosClient.getResults(projectId);
        setValores(data.result);
        setAllComments(data.comments || {});
        setAnalisis(data.comments?.estadoResultados || "");
        savedComment.current = data.comments?.estadoResultados || "";
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (analisis === savedComment.current) {
      toast.success("No hay cambios que guardar.");
      return;
    }
    try {
      await axiosClient.saveComment(projectId, "estadoResultados", analisis);
      savedComment.current = analisis;
      toast.success("Comentario guardado correctamente.");
    } catch (error) {
      toast.error("Error al guardar el comentario.");
    }
  };

  // Formatea un número como moneda COP
  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "$0";
    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={tituloEstadoResultados} alt="Estado de Resultado" className="robot-img-an-re" />
        </div>

        <div className="contenido-container">
          <p className="estado-parrafo">
            El estado de resultados, también llamado «cuenta de pérdidas y ganancias», es un informe financiero que detalla los ingresos y gastos de una empresa durante un período de tiempo específico para determinar si generó utilidad o pérdida neta. Su objetivo principal es medir el desempeño financiero de la empresa y proporcionar información útil a los inversores y a la dirección para la toma de decisiones.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="proyeccion-container">
              <div className="estado-tabla-container">
                <table className="estado-tabla">
                  <thead>
                    <tr className="estado-tabla-encabezado">
                      <th className="estado-columna-concepto">CONCEPTO</th>
                      {anios.map((anio) => (
                        <th key={anio} className="estado-columna-anio">{anio}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conceptos.map(({ label, key, bold, black }) => (
                      <tr key={key} className={`estado-fila ${black ? "fila-black" : ""} ${bold && !black ? "fila-negrita" : ""}`}>
                        <td className={`estado-concepto ${bold ? "texto-negrita" : ""}`}>
                          {label}
                        </td>
                        {anios.map((anio, i) => (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {formatCurrency(valores.estadoResultados?.[key]?.[i])}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="estado-analisis-container">
                  <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
                  <textarea
                    id="ana-est-res"
                    rows={10}
                    className="estado-textarea"
                    placeholder="Escribe aquí tu análisis..."
                    value={analisis}
                    onChange={(e) => setAnalisis(e.target.value)}
                  />
                </div>
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
              <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
              <button className="nav-btn siguiente" onClick={async () => {
                const updatedComments = { ...allComments, estadoResultados: analisis };
                if (analisis !== savedComment.current) {
                  try { await axiosClient.saveComment(projectId, "estadoResultados", analisis); } catch(e) {}
                }
                navigate("/flujoEfectivo", {
                  state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores, comments: updatedComments } : null }
                });
              }}></button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EstadoResultados;
