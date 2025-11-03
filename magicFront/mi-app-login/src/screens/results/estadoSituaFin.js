import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloEstadoSituaFin from "../../images/titulo_estado_financiera.png";
import tituloActivos from "../../images/activos.png";
import tituloPasivos from "../../images/pasivos.png";
import tituloPatrimonio from "../../images/patrimonio.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const EstadoSituaFin = () => {
  const navigate = useNavigate();

  const anios = ["Inicio 2025", 2025, 2026, 2027, 2028, 2029];

  const estructura = [
    { tipo: "titulo", titulo: "Activos corrientes" },
    { tipo: "separador" },
    { label: "Disponible", key: "disponible" },
    { label: "Inversiones temporales", key: "inversiones_temporales" },
    { label: "Deudores (cuentas por cobrar)", key: "deudores" },
    { label: "Inventarios", key: "inventarios" },
    { label: "Otros activos", key: "otros_activos" },
    { label: "Total activo corriente", key: "total_activo_corriente", dark: true },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Activos de largo plazo" },
    { tipo: "separador" },
    { label: "Muebles y enseres", key: "muebles" },
    { label: "Maquinaria y equipo", key: "maquinaria" },
    { label: "Vehículos", key: "vehiculos" },
    { label: "Terrenos", key: "terrenos" },
    { label: "Edificaciones", key: "edificaciones" },
    { label: "Equipo de computación", key: "equipo_computo" },
    { label: "Depreciación acumulada", key: "depreciacion_acumulada" },
    { label: "Activos Diferidos", key: "activos_diferidos" },
    { label: "Amortización acumulada", key: "amortizacion_acumulada" },
    { label: "Total activos NO corrientes", key: "total_activos_no_corrientes", dark: true },
    { tipo: "separador" },

    { label: "Total activos", key: "total_activos", dark: true, blue: true },

    { tipo: "titulo", titulo: "Pasivos corrientes" },
    { label: "Proveedores", key: "proveedores" },
    { label: "Impuesto por pagar", key: "impuesto_pagar" },
    { label: "Cuenta por Pagar a Socios 1er año", key: "cuenta_socios_1er" },
    { label: "Cuenta por Pagar a Socios", key: "cuenta_socios" },
    { label: "Obligaciones financieras corrientes", key: "obligaciones_corrientes" },
    { label: "Total pasivos corrientes", key: "total_pasivos_corrientes", dark: true },
    { tipo: "separador" },

    { tipo: "titulo", titulo: "Pasivos no corrientes" },
    { tipo: "separador" },
    { label: "Obligaciones financieras no corrientes", key: "obligaciones_no_corrientes" },
    { tipo: "separador" },
    { label: "Total pasivos NO corrientes", key: "total_pasivos_no_corrientes", dark: true },
    { tipo: "separador" },

    { label: "Total pasivos", key: "total_pasivos", dark: true, blue: true },

    { tipo: "titulo", titulo: "Patrimonio" },
    { label: "Capital", key: "capital" },
    { label: "Capital ADICIONAL por parte de Socios", key: "capital_adicional" },
    { label: "Reserva Legal", key: "reserva_legal" },
    { label: "Utilidades retenidas", key: "utilidades_retenidas" },
    { label: "Utilidad del periodo", key: "utilidad_periodo" },
    { label: "Total patrimonio", key: "total_patrimonio", dark: true },
    { tipo: "separador" },

    { label: "Total pasivo y patrimonio", key: "total_pasivo_patrimonio", dark: true, blue: true },
    { tipo: "separador" },

    { label: "Decisión Junta Directiva", key: "decision_junta" },
    { label: "Monto Junta Directiva", key: "monto_junta" },
  ];

  const [valores, setValores] = useState(
    estructura.reduce((acc, item) => {
      if (!item.key) return acc;
      acc[item.key] = anios.reduce((a, anio) => ({ ...a, [anio]: "" }), {});
      return acc;
    }, {})
  );

  const [analisis, setAnalisis] = useState("");

  // 🔹 Cargar datos desde backend
  useEffect(() => {
    fetch("http://localhost:5000/api/estado-situacion")
      .then((res) => res.json())
      .then((data) => {
        const nuevosValores = { ...valores };
        estructura.forEach((item) => {
          if (item.key && data[item.key]) {
            anios.forEach((anio) => {
              nuevosValores[item.key][anio] = data[item.key][anio] || 0;
            });
          }
        });
        setValores(nuevosValores);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []); // Solo al montar

  const handleGuardar = (e) => {
    e.preventDefault();
    alert("Progreso guardado correctamente.");
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={tituloEstadoSituaFin} alt="Estado Financiero" className="robot-img-es-si" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh
              euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
            </p>

            <div className="container-titulo">
              <img src={tituloActivos} alt="Estado Financiero" className="titulo-img-es-si" />
            </div>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.key || i}>
                      {item.titulo === "Pasivos corrientes" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="fila-imagen-centro">
                            <img src={tituloPasivos} alt="Imagen Pasivos" className="titulo-img-es-si" />
                          </td>
                        </tr>
                      )}

                      {item.titulo === "Patrimonio" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="fila-imagen-centro">
                            <img
                              src={tituloPatrimonio}
                              alt="Imagen Patrimonio"
                              className="titulo-img-es-si"
                            />
                          </td>
                        </tr>
                      )}

                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          {[
                            "Activos corrientes",
                            "Activos de largo plazo",
                            "Pasivos corrientes",
                            "Pasivos no corrientes",
                            "Patrimonio",
                          ].includes(item.titulo) ? (
                            <>
                              <td className="estado-concepto fila-aporte-adicional">{item.titulo}</td>
                              {anios.map((anio, index) => (
                                <td key={index} className="estado-celda anio-celda">
                                  {anio}
                                </td>
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

                      {item.key && (
                        <tr
                          className={`estado-fila 
                            ${item.dark ? "fila-gray" : ""} 
                            ${item.blue ? "fila-blue" : ""} 
                            ${["decision_junta", "monto_junta"].includes(item.key) ? "fila-decision-roja" : ""}
                          `}
                        >
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda-gray">
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

                      {item.key === "decision_junta" && (
                        <tr>
                          <td colSpan={anios.length + 1} className="mensaje-explicacion">
                            En caso de que se presente un monto en la "Decisión Junta Directiva",
                            se deberá explicar las razones de esta cifra y plantear una solución
                            financiera.
                          </td>
                        </tr>
                      )}

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
                <img src={tituloComentarios} alt="Comentarios" className="robot-img-an-re" />
                <textarea
                  id="ana-estado-situacion"
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
                  <strong>Antes de seguir</strong>, asegúrate de guardar tu progreso. Haz clic aquí
                  para no perder tu avance.
                </span>
                <div className="guardar-avance-icono">
                  <DownloadCloud size={24} />
                </div>
              </button>
            </div>

            <div className="buttons-container">
              <button
                className="nav-btn anterior"
                type="button"
                onClick={() => navigate(-1)}
              ></button>
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

export default EstadoSituaFin;
