import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloEstadoResultados from "../../images/titulo_estado_resultado.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const EstadoResultados = () => {
  const navigate = useNavigate();

  const anios = [2025, 2026, 2027, 2028, 2029];

  const conceptos = [
    { label: "Ventas", key: "ventas" },
    { label: "Costos", key: "costos" },
    { label: "Utilidad bruta", key: "utilidad_bruta", bold: true },
    { label: "Gastos operativos", key: "gastos_operativos" },
    { label: "Utilidad antes impuestos e intereses", key: "utilidad_antes_intereses", bold: true },
    { label: "Gastos financieros", key: "gastos_financieros" },
    { label: "Ingresos financieros", key: "ingresos_financieros" },
    { label: "Utilidad antes de impuestos", key: "utilidad_antes_impuestos", bold: true },
    { label: "Impuestos", key: "impuestos" },
    { label: "Utilidad neta", key: "utilidad_neta", bold: true, black: true },
  ];

  // 🔹 Estado para guardar los valores que vienen del backend
  const [valores, setValores] = useState({});
  const [analisis, setAnalisis] = useState("");

  // 🔹 Llamada al backend cuando carga el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/estado-resultados");
        const data = await res.json();
        setValores(data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
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
                        {anios.map((anio) => (
                          <td key={anio} className="estado-celda">
                            <span className="estado-dato">
                              {valores[key]?.[anio]?.toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              }) || "$0"}
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
              <button className="nav-btn siguiente" onClick={() => navigate("/planFinanciero")}></button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EstadoResultados;
