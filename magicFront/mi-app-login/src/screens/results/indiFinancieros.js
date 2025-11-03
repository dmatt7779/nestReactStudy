import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloIndiFinancieros from "../../images/titulo_indicadores_liquidez_actividades.png"; 
import tituloIndiLiq from "../../images/indi_fi_liq.png"; 
import tituloIndiEnd from "../../images/indi_fi_end.png"; 
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const IndiFinancieros = () => {
  const navigate = useNavigate();
  const anios = [2025, 2026, 2027, 2028, 2029];

  const [valores, setValores] = useState({
    liquidezActividad: {
      razonCorriente: {},
      solidez: {},
      capitalTrabajo: {},
    },
    endeudamiento: {
      indiceEndeudamiento: {},
      endeudamientoCortoPlazo: {},
      patrimonioPasivos: {},
    },
  });

  const [analisis, setAnalisis] = useState("");

  // Simular datos desde BD
  useEffect(() => {
    const dataFromDb = {
      liquidezActividad: {
        razonCorriente: { 2025: 1.2, 2026: 1.3, 2027: 1.25, 2028: 1.4, 2029: 1.5 },
        solidez: { 2025: 0.65, 2026: 0.67, 2027: 0.7, 2028: 0.72, 2029: 0.74 },
        capitalTrabajo: { 2025: 25000, 2026: 27000, 2027: 29000, 2028: 31000, 2029: 33000 },
      },
      endeudamiento: {
        indiceEndeudamiento: { 2025: 0.55, 2026: 0.52, 2027: 0.5, 2028: 0.48, 2029: 0.47 },
        endeudamientoCortoPlazo: { 2025: 0.3, 2026: 0.28, 2027: 0.27, 2028: 0.25, 2029: 0.24 },
        patrimonioPasivos: { 2025: 50000, 2026: 52000, 2027: 54000, 2028: 56000, 2029: 58000 }, // 🔹 numérico
      },
    };

    setValores(dataFromDb);
  }, []);

  const handleGuardar = (e) => {
    e.preventDefault();
    alert("Progreso guardado correctamente.");
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
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
            </p>

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
                  <tr>
                    <td>Razón Corriente</td>
                    <td>Activo corriente / Pasivo corriente</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.liquidezActividad.razonCorriente[anio]?.toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Solidez</td>
                    <td>Activo total / Pasivo total</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.liquidezActividad.solidez[anio]?.toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Capital de Trabajo</td>
                    <td>Activo corriente - Pasivo CTE</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.liquidezActividad.capitalTrabajo[anio]?.toLocaleString("es-CO")}</td>
                    ))}
                  </tr>
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
                  <tr>
                    <td className="estado-concepto">Índice de endeudamiento</td>
                    <td className="estado-concepto">Pasivo total / Activo total</td>
                    {anios.map((anio) => (
                      <td className="estado-concepto" key={anio}>{(valores.endeudamiento.indiceEndeudamiento[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="estado-concepto">Endeudamiento a corto plazo</td>
                    <td className="estado-concepto">Pasivo corriente / (Pasivo total + Activo total)</td>
                    {anios.map((anio) => (
                      <td className="estado-concepto" key={anio}>{(valores.endeudamiento.endeudamientoCortoPlazo[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="estado-concepto">Patrimonio a pasivos</td>
                    <td className="estado-concepto">Patrimonio / Pasivo total</td>
                    {anios.map((anio) => (
                      <td  className="estado-concepto"key={anio}>{valores.endeudamiento.patrimonioPasivos[anio]?.toLocaleString("es-CO")}</td>
                    ))}
                  </tr>
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
              <button className="nav-btn siguiente" type="button" onClick={() => navigate("/estadoResultados")}></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default IndiFinancieros;
