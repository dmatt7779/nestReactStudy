import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloIndicadores from "../../images/titulo_indicadores.png";
import tituloRentabilidad from "../../images/indi_ren.png";
import tituloGeneracion from "../../images/indi_ge_va.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const Indicadores = () => {
  const navigate = useNavigate();
  const anios = [2025, 2026, 2027, 2028, 2029];

  const [valores, setValores] = useState({
    rentabilidad: {
      margenBruto: {},
      margenOperacional: {},
      margenNeto: {},
      rendimientoPatrimonio: {},
      rendimientoActivo: {},
    },
    generacion: {
      ktno: {},
      pkt: {},
      roa: {},
      roi: {},
      margenEbitda: {},
      cpp: {},
      ran: {},
      eva1: {},
      eva2: {},
      evaPct: {},
    },
  });

  const [analisis, setAnalisis] = useState("");

  // Simular datos desde la BD
  useEffect(() => {
    const dataFromDb = {
      rentabilidad: {
        margenBruto: { 2025: 0.35, 2026: 0.37, 2027: 0.38, 2028: 0.4, 2029: 0.42 },
        margenOperacional: { 2025: 0.22, 2026: 0.24, 2027: 0.25, 2028: 0.26, 2029: 0.27 },
        margenNeto: { 2025: 0.18, 2026: 0.19, 2027: 0.20, 2028: 0.21, 2029: 0.22 },
        rendimientoPatrimonio: { 2025: 0.15, 2026: 0.16, 2027: 0.17, 2028: 0.18, 2029: 0.19 },
        rendimientoActivo: { 2025: 0.12, 2026: 0.13, 2027: 0.14, 2028: 0.15, 2029: 0.16 },
      },
      generacion: {
        ktno: { 2025: 12000, 2026: 12500, 2027: 13000, 2028: 13500, 2029: 14000 },
        pkt: { 2025: 0.3, 2026: 0.32, 2027: 0.34, 2028: 0.35, 2029: 0.36 },
        roa: { 2025: 0.25, 2026: 0.26, 2027: 0.27, 2028: 0.28, 2029: 0.29 },
        roi: { 2025: 0.3, 2026: 0.31, 2027: 0.32, 2028: 0.33, 2029: 0.34 },
        margenEbitda: { 2025: 0.4, 2026: 0.41, 2027: 0.42, 2028: 0.43, 2029: 0.44 },
        cpp: { 2025: 0.12, 2026: 0.11, 2027: 0.1, 2028: 0.1, 2029: 0.09 },
        ran: { 2025: 0.14, 2026: 0.15, 2027: 0.15, 2028: 0.16, 2029: 0.16 },
        eva1: { 2025: 2300, 2026: 2400, 2027: 2500, 2028: 2600, 2029: 2700 },
        eva2: { 2025: 2200, 2026: 2250, 2027: 2300, 2028: 2350, 2029: 2400 },
        evaPct: { 2025: 0.05, 2026: 0.06, 2027: 0.065, 2028: 0.07, 2029: 0.075 },
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
          <img src={tituloIndicadores} alt="Indicadores" className="robot-img-ind" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
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
                  <tr>
                    <td>Margen Bruto</td>
                    <td>Resultado Bruto / Ventas</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.rentabilidad.margenBruto[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Margen Operacional</td>
                    <td>Resultado Operacional / Ventas</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.rentabilidad.margenOperacional[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Margen Neto de Utilidad</td>
                    <td>Resultado del ejercicio / Ventas</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.rentabilidad.margenNeto[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Rendimiento del Patrimonio</td>
                    <td>Resultado del ejercicio / Patrimonio</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.rentabilidad.rendimientoPatrimonio[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Rendimiento del Activo</td>
                    <td>Resultado del ejercicio / Activo Total</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.rentabilidad.rendimientoActivo[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
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
                  <tr>
                    <td>KTNO</td>
                    <td>C x C + Inventarios - C x P</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.generacion.ktno[anio]?.toLocaleString("es-CO")}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>PKT</td>
                    <td>KTNO / Ingresos</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.pkt[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>ROA (Rendimiento Activo)</td>
                    <td>UAI / Activos Netos Operativos</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.roa[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>ROI (Rendimiento Patrimonio)</td>
                    <td>UAI / Patrimonio</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.roi[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Margen EBITDA</td>
                    <td>EBITDA / Ingresos</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.margenEbitda[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Costo Promedio Ponderado</td>
                    <td>—</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.cpp[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>RAN</td>
                    <td>UODI / Activos de Operación</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.ran[anio] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>EVA</td>
                    <td>UODI - Activos x CK</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.generacion.eva1[anio]?.toLocaleString("es-CO")}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>EVA</td>
                    <td>Activos x (RAN - CK)</td>
                    {anios.map((anio) => (
                      <td key={anio}>{valores.generacion.eva2[anio]?.toLocaleString("es-CO")}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>% EVA</td>
                    <td>EVA / Ventas</td>
                    {anios.map((anio) => (
                      <td key={anio}>{(valores.generacion.evaPct[anio] * 100).toFixed(2)}%</td>
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
              <button className="nav-btn siguiente" type="button" onClick={() => navigate("/otraPantalla")}></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Indicadores;
