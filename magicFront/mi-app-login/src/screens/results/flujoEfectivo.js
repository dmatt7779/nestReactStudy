import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloFlujoEfectivo from "../../images/titulo_flujo_efectivo.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const FlujoEfectivo = () => {
  const navigate = useNavigate();

  const anios = ["Inicio 2025", 2025, 2026, 2027, 2028, 2029];

  const estructura = [
    { tipo: "titulo", titulo: "Actividad de operación" },
    { tipo: "separador" },
    { label: "Ventas de contado", key: "ventas_contado" },
    { label: "Recuperación de cartera", key: "recuperacion_cartera" },
    { label: "Costos operativos", key: "costos_operativos" },
    { label: "Gastos operativos", key: "gastos_operativos" },
    { label: "Pago de proveedores", key: "pago_proveedores" },
    { label: "Inversión en Inventario Inicial", key: "inversion_inventario" },
    { label: "Impuestos", key: "impuestos" },
    { label: "Depreciación y amortización ( - )", key: "depreciacion" },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Actividad de financiación" },
    { tipo: "separador" },
    { label: "Aportes Inicial de capital por Socios", key: "aportes_inicial" },
    { label: "Adquisición de préstamos", key: "prestamos" },
    { label: "Aporte ADICIONAL de capital por Socios", key: "aporte_adicional" },
    { label: "Rendimientos financieros", key: "rendimientos" },
    { label: "Servicio de la deuda", key: "servicio_deuda" },
    { label: "Intereses", key: "intereses" },
    { label: "Dividendos según el ejercicio anterior", key: "dividendos" },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Actividad de inversión" },
    { tipo: "separador" },
    { label: "Venta de activos fijos", key: "venta_activos" },
    { label: "Inversión activos fijos", key: "inversion_activos" },
    { tipo: "separador" },

    { label: "Excedente o déficit efectivo", key: "excedente1", dark: true },
    { tipo: "separador" },

    { label: "Decisión Junta Directiva (Aporte Socios)", key: "decision_junta", red: true },
    { tipo: "separador" },

    { label: "Saldo inicial", key: "saldo_inicial", dark: true },
    { tipo: "separador" },
    
    { label: "Saldo final de efectivo", key: "saldo_final", dark: true },
  ];

  // Estado inicial vacío
  const [valores, setValores] = useState({});
  const [analisis, setAnalisis] = useState("");

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/flujo-efectivo");
        const data = await res.json();
        setValores(data); // data vendrá en formato { ventas_contado: {2025: 1000, ...}, ... }
      } catch (error) {
        console.error("Error cargando flujo de efectivo:", error);
      }
    };

    fetchData();
  }, []);

  const handleGuardar = (e) => {
    e.preventDefault();
    alert("Progreso guardado correctamente.");
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img
            src={tituloFlujoEfectivo}
            alt="Flujo de Efectivo"
            className="robot-img-an-re"
          />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              El flujo de efectivo es el movimiento neto de dinero, tanto entradas como salidas, que ingresa y sale de una empresa o negocio durante un período determinado. Sirve como un indicador de la salud financiera, mostrando la liquidez de la compañía y su capacidad para cubrir gastos y obligaciones.
            </p>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.key || i}>
                      {/* TITULOS DE SECCIÓN CON AÑOS */}
                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          <td className="estado-concepto fila-aporte-adicional">
                            {item.titulo}
                          </td>
                          {anios.map((anio, index) => (
                            <td key={index} className="estado-celda fila-anios">{anio}</td>
                          ))}
                        </tr>
                      )}

                      {/* FILAS DE DATOS */}
                      {item.key && (
                        <tr
                          className={`estado-fila 
                           ${item.dark ? "fila-black" : ""}
                           ${item.red ? "fila-red" : ""}
                           ${item.key === "decision_junta" ? "fila-decision-roja" : ""}
                          `}
                        >
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda">
                              <span className="estado-dato">
                                {valores[item.key]?.[anio]?.toLocaleString("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }) || "$0"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      )}

                      {/* MENSAJE EXPLICATIVO */}
                      {item.key === "decision_junta" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="mensaje-explicacion">
                            En caso de que se presente un monto en la "Decisión Junta
                            Directiva", se deberá explicar las razones de esta cifra y
                            plantear una solución financiera.
                          </td>
                        </tr>
                      )}

                      {/* FILA SEPARADOR */}
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
                <img
                  src={tituloComentarios}
                  alt="Comentarios"
                  className="robot-img-an-re"
                />
                <textarea
                  id="ana-flujo-efec"
                  rows={10}
                  className="estado-textarea"
                  placeholder="Escribe aquí tu análisis..."
                  value={analisis}
                  onChange={(e) => setAnalisis(e.target.value)}
                />
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
              <button className="nav-btn anterior" type="button" onClick={() => navigate(-1)}></button>
              <button
                className="nav-btn siguiente"
                type="button"
                onClick={() => navigate("/estadoSituFin")}
              ></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default FlujoEfectivo;
