import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloWacc from "../../images/titulo_wacc.png";
import tituloMedia from "../../images/titulo_media.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const Wacc = () => {
  const navigate = useNavigate();
  const anios = [2025, 2026, 2027, 2028, 2029];

  const [valores, setValores] = useState({
    pasivoPatrimonio: {},
    participacion: {},
    tasas: {},
  });

  const [analisis, setAnalisis] = useState("");

  // Simular carga desde BD
  useEffect(() => {
    const dataFromDb = {
      pasivoPatrimonio: {
        proveedores: { 2025: 50000, 2026: 60000, 2027: 65000, 2028: 70000, 2029: 75000 },
        impuestoPagar: { 2025: 20000, 2026: 21000, 2027: 22000, 2028: 23000, 2029: 24000 },
        obligacionesCorrientes: { 2025: 30000, 2026: 35000, 2027: 36000, 2028: 37000, 2029: 38000 },
        obligacionesNoCorrientes: { 2025: 80000, 2026: 82000, 2027: 85000, 2028: 88000, 2029: 90000 },
        patrimonio: { 2025: 150000, 2026: 160000, 2027: 170000, 2028: 180000, 2029: 190000 },
        total: { 2025: 330000, 2026: 358000, 2027: 378000, 2028: 398000, 2029: 417000 },
      },
      participacion: {
        proveedores: { 2025: 0.15, 2026: 0.16, 2027: 0.17, 2028: 0.18, 2029: 0.19 },
        impuestoPagar: { 2025: 0.05, 2026: 0.06, 2027: 0.06, 2028: 0.07, 2029: 0.07 },
        obligacionesCorrientes: { 2025: 0.09, 2026: 0.10, 2027: 0.11, 2028: 0.12, 2029: 0.12 },
        obligacionesNoCorrientes: { 2025: 0.24, 2026: 0.23, 2027: 0.22, 2028: 0.22, 2029: 0.21 },
        patrimonio: { 2025: 0.47, 2026: 0.45, 2027: 0.44, 2028: 0.43, 2029: 0.41 },
        costoPromedio: { 2025: 0.12, 2026: 0.13, 2027: 0.14, 2028: 0.15, 2029: 0.16 },
      },
      tasas: {
        proveedores: 0.10,
        impuestoPagar: 0.08,
        obligacionesCorrientes: 0.12,
        obligacionesNoCorrientes: 0.11,
        patrimonio: 0.15,
        costoPromedio: 0.125,
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
                  {Object.keys(valores.pasivoPatrimonio).map((key, idx) => (
                    <tr key={idx} className={key === "total" ? "fila-gray" : ""}>
                      <td className="estado-concepto">
                        {key === "impuestoPagar"
                          ? "Impuesto por pagar"
                          : key === "obligacionesCorrientes"
                          ? "Obligaciones financieras corrientes"
                          : key === "obligacionesNoCorrientes"
                          ? "Obligaciones financieras NO corrientes"
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </td>
                      {anios.map((anio) => (
                        <td key={anio} className="estado-celda">
                          {valores.pasivoPatrimonio[key][anio]?.toLocaleString("es-CO")}
                        </td>
                      ))}
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
                  {Object.keys(valores.participacion).map((key, idx) => (
                    <tr key={idx} className={key === "costoPromedio" ? "fila-gray" : ""}>
                      <td className="estado-concepto">
                        {key === "impuestoPagar"
                          ? "Impuesto por pagar"
                          : key === "obligacionesCorrientes"
                          ? "Obligaciones financieras corrientes"
                          : key === "obligacionesNoCorrientes"
                          ? "Obligaciones financieras NO corrientes"
                          : key === "costoPromedio"
                          ? "Costo promedio ponderado"
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </td>
                      {anios.map((anio) => (
                        <td key={anio} className="estado-celda">
                          {(valores.participacion[key][anio] * 100).toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bloque tasas */}
            <img src={tituloMedia} alt="Media aritmética" className="robot-tit-wacc" />
            <div className="bloque-tasas">
                
              <table className="tabla-tasas">
                <tbody>
                  <tr>
                    <td className="celda-azul">Tasa Proveedores</td>
                    <td>{(valores.tasas.proveedores * 100).toFixed(2)}%</td><td></td>
                    <tr className="fila-gray">
                    <td colSpan={2}>
                      <h4>Costo promedio ponderado</h4>
                    </td>
                  </tr>
                  </tr>

                  <tr>
                    <td className="celda-azul">Tasa Impuesto por pagar</td>
                    <td>{(valores.tasas.impuestoPagar * 100).toFixed(2)}%</td><td></td>
                    <td className="celda-naranja">
                      {(valores.tasas.impuestoPagar * 100).toFixed(2)}%
                    </td>
                  </tr>

                  <tr>
                    <td className="celda-azul">Tasa Obligaciones financieras corrientes</td>
                    <td>{(valores.tasas.obligacionesCorrientes * 100).toFixed(2)}%</td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="celda-azul">Tasa Obligaciones financieras NO corrientes</td>
                    <td>{(valores.tasas.obligacionesNoCorrientes * 100).toFixed(2)}%</td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="celda-azul">Tasa Patrimonio</td>
                    <td>{(valores.tasas.patrimonio * 100).toFixed(2)}%</td>
                    <td></td>
                  </tr>

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
              <button className="nav-btn siguiente" type="button" onClick={() => navigate("/flujoCaja")}></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Wacc;
