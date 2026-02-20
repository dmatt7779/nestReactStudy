import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloEstadoResultados from "../../images/titulo_estado_resultado.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import axiosClient from "../../utils/axios";

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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (resultadosCalculados && Object.keys(resultadosCalculados).length > 0) {          
          const result = resultadosCalculados.result;
          console.log("📊 Datos recibidos por navegación (resultadosCalculados):", resultadosCalculados);
          console.log("📌 estadoResultados:", result.estadoResultados);
          console.log("📌 flujoEfectivo:", result.flujoEfectivo);
          console.log("📌 EstadoSituacionFinanc:", result.EstadoSituacionFinanc);
          console.log("📌 flujoCaja:", result.flujoCaja);
          console.log("📌 wacc:", result.wacc);
          console.log("📌 indLiquidez:", result.indLiquidez);
          console.log("📌 indEndeudamiento:", result.indEndeudamiento);
          console.log("📌 indRentabilidad:", result.indRentabilidad);
          console.log("📌 excelPath:", result.excelPath);
          setValores(result);
        } else {
          console.log("🔄 No hay datos en state. Obteniendo resultados de la BD para projectId:", projectId);
          const data = await axiosClient.getResults(projectId);
          const result = data.result;
          console.log("📊 Datos obtenidos de la BD:", data);
          console.log("📌 estadoResultados:", result.estadoResultados);
          console.log("📌 flujoEfectivo:", result.flujoEfectivo);
          console.log("📌 EstadoSituacionFinanc:", result.EstadoSituacionFinanc);
          console.log("📌 flujoCaja:", result.flujoCaja);
          console.log("📌 wacc:", result.wacc);
          console.log("📌 indLiquidez:", result.indLiquidez);
          console.log("📌 indEndeudamiento:", result.indEndeudamiento);
          console.log("📌 indRentabilidad:", result.indRentabilidad);
          console.log("📌 excelPath:", result.excelPath);
          setValores(result);
        }
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId, resultadosCalculados]);

  const handleSubmit = (event) => {
    event.preventDefault();
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
              <button className="nav-btn siguiente" onClick={() => navigate("/flujoEfectivo", {
                state: { projectId, openingYear, resultadosCalculados: valores ? { result: valores } : null }
              })}></button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EstadoResultados;
