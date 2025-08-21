import React, { useState } from "react";
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
    { label: "Ventas de contado", key: "ventas_contado" },
    { label: "Recuperación de cartera", key: "recuperacion_cartera" },
    { label: "Costos operativos", key: "costos_operativos" },
    { label: "Gastos operativos", key: "gastos_operativos" },
    { label: "Pago de proveedores", key: "pago_proveedores" },
    { label: "Inversión en Inventario Inicial", key: "inversion_inventario" },
    { label: "Impuestos", key: "impuestos" },
    { label: "Depreciación y amortización ( - )", key: "depreciacion" },

    { tipo: "titulo", titulo: "Actividad de financiación" },
    { label: "Aportes Inicial de capital por Socios", key: "aportes_inicial" },
    { label: "Adquisición de préstamos", key: "prestamos" },
    { label: "Aporte ADICIONAL de capital por Socios", key: "aporte_adicional" },
    { label: "Rendimientos financieros", key: "rendimientos" },
    { label: "Servicio de la deuda", key: "servicio_deuda" },
    { label: "Intereses", key: "intereses" },
    { label: "Dividendos según el ejercicio anterior", key: "dividendos" },

    { tipo: "titulo", titulo: "Actividad de inversión" },
    { label: "Venta de activos fijos", key: "venta_activos" },
    { label: "Inversión Activos Fijos", key: "inversion_activos" },

    { label: "EXCEDENTE O DÉFICIT EFECTIVO", key: "excedente1", dark: true },
    { label: "Decisión Junta Directiva (Aporte Socios)", key: "decision_junta", blue: true },
    { label: "SALDO INICIAL", key: "saldo_inicial", dark: true },
    { label: "SALDO FINAL DE EFECTIVO", key: "saldo_final", dark: true },
  ];

  const [valores, setValores] = useState(
    estructura.reduce((acc, item) => {
      if (!item.key) return acc;
      acc[item.key] = anios.reduce((a, anio) => ({ ...a, [anio]: "" }), {});
      return acc;
    }, {})
  );

  const [analisis, setAnalisis] = useState("");

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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
              volutpat.
            </p>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.key || i}>
                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          {item.titulo === "Actividad de operación" ? (
                            <>
                              <td className="estado-concepto fila-aporte-adicional">
                                {item.titulo}
                              </td>
                              {anios.map((anio, index) => (
                                <td key={index} className="estado-celda">{anio}</td>
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

                      {item.key === "saldo_inicial" && (
                        <tr className="fila-espaciado">
                          <td colSpan={anios.length + 1}></td>
                        </tr>
                      )}
                      {item.key === "saldo_final" && (
                        <tr className="fila-espaciado">
                          <td colSpan={anios.length + 1}></td>
                        </tr>
                      )}

                      {item.key && (
                        <tr
                          className={`estado-fila ${
                            item.dark ? "fila-black" : ""
                          } ${item.red ? "fila-red" : ""} ${item.blue ? "fila-blue" : ""}`}
                        >
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda">
                              <span className="estado-dato">
                                {valores[item.key][anio]?.toLocaleString("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }) || "$0"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      )}

                      {item.key === "excedente1" && (
                        <tr className="fila-espaciado">
                          <td colSpan={anios.length + 1}></td>
                        </tr>
                      )}

                      {item.key === "decision_junta" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="mensaje-explicacion">
                            En caso de que se presente un monto en la "Decisión Junta
                            Directiva", se deberá explicar las razones de esta cifra y
                            plantear una solución financiera.
                          </td>
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
                  rows={5}
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
                onClick={() => navigate("/estadoResultados")}
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
