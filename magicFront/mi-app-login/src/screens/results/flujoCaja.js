import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloFlujoCaja from "../../images/titulo_flujo_caja.png";
import tituloPuntoEqu from "../../images/punto_equ.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";
import CustomInput from "../../components/CustomInput";

const FlujoCaja = () => {
  const navigate = useNavigate();
  const anios = [2025, 2026, 2027, 2028, 2029];

  // Estructura de flujo de caja
  const estructura = [
    { tipo: "titulo", titulo: "Concepto" },
    { tipo: "separador" },
    { label: "Ventas", key: "ventas" },
    { label: "Costos", key: "costos" },
    { label: "Gastos operativos", key: "gastos_operativos" },
    { tipo: "separador" },
    { label: "Utilidad operativa", key: "utilidad_operativa", dark: true },
    { tipo: "separador" },
    { label: "Impuesto de renta operativo", key: "impuesto_renta" },
    { label: "Beneficio fiscal financiero", key: "beneficio_fiscal" },
    { tipo: "separador" },
    { label: "Utilidad operativa después de impuestos", key: "utilidad_impuesto", dark: true },
    { tipo: "separador" },
    { label: "Depreciación y amortización", key: "depreciacion_amortizacion" },
    { tipo: "separador" },
    { label: "Flujo de caja bruto operativo", key: "flujo_caja_bruto", dark: true },
    { tipo: "separador" },
    { tipo: "tir_inversionista" },
    { tipo: "separador" },
    { tipo: "punto_equilibrio" },
  ];

  // Indicadores
  const indicadores = [
    { key: "tir_proyecto", label: "TIR del proyecto", type: "percentage", ayuda: "▶ Mayor que la TMRR" },
    { key: "tmrr_cok", label: "TMRR o COK", type: "percentage", ayuda: "▶ Tasa mínima de retorno requerida por el inversionista" },
    { key: "tir_modificada", label: "TIR modificada del proyecto", type: "percentage", ayuda: "▶ Mayor a la TMRR" },
    { key: "tmrr", label: "VPN del proyecto (TMRR)", type: "currency", ayuda: "▶ Mayor a cero" },
  ];

  // Estado inicial de flujo de caja
  const inicial = estructura.reduce((acc, item) => {
    if (!item.key) return acc;
    if (item.indicador) {
      acc[item.key] = 0;
    } else {
      acc[item.key] = anios.reduce((a, anio) => ({ ...a, [anio]: 0 }), {});
    }
    return acc;
  }, {});

  // Estado unificado
  const [valores, setValores] = useState({
    flujoCaja: inicial,
    indicadores: {
      tir_proyecto: 0,
      tmrr_cok: 0,
      tir_modificada: 0,
      tmrr: 0,
      tir_inversionista: 0,
      tmrr_inversionista: 0,
      tir_modificada_inversionista: 0,
      vpn_inversionista: 0,
    },
    puntoEquilibrio: {
      unidadesAnual: 0,
      unidadesMensual: 0,
      pesosAnual: 0,
      pesosMensual: 0,
    },
  });

  const [analisis, setAnalisis] = useState("");

  // Cargar datos desde BD (simulado)
  useEffect(() => {
    const dataFromDb = {
      flujoCaja: {
        ventas: { 2025: 1200000, 2026: 1300000, 2027: 1400000, 2028: 1500000, 2029: 1600000 },
        costos: { 2025: 400000, 2026: 420000, 2027: 440000, 2028: 460000, 2029: 480000 },
        gastos_operativos: { 2025: 200000, 2026: 210000, 2027: 220000, 2028: 230000, 2029: 240000 },
        utilidad_operativa: { 2025: 600000, 2026: 670000, 2027: 740000, 2028: 810000, 2029: 880000 },
        impuesto_renta: { 2025: 150000, 2026: 167500, 2027: 185000, 2028: 202500, 2029: 220000 },
        beneficio_fiscal: { 2025: 5000, 2026: 5000, 2027: 5000, 2028: 5000, 2029: 5000 },
        utilidad_impuesto: { 2025: 455000, 2026: 497500, 2027: 550000, 2028: 602500, 2029: 655000 },
        depreciacion_amortizacion: { 2025: 50000, 2026: 50000, 2027: 50000, 2028: 50000, 2029: 50000 },
        flujo_caja_bruto: { 2025: 505000, 2026: 547500, 2027: 600000, 2028: 652500, 2029: 705000 },
      },
      indicadores: {
        tir_proyecto: 0.1845,
        tmrr_cok: 0.12,
        tir_modificada: 0.165,
        tmrr: 12500000.45,
        tir_inversionista: 0.2,
        tmrr_inversionista: 0.1,
        tir_modificada_inversionista: 0.18,
        vpn_inversionista: 8500000,
      },
      puntoEquilibrio: {
        unidadesAnual: 1200,
        unidadesMensual: 100,
        pesosAnual: 15000000,
        pesosMensual: 1250000,
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
        <div className="robot-container-an">
          <img src={tituloFlujoCaja} alt="Flujo de Caja" className="robot-img-fl-ca" />
        </div>

        <form onSubmit={handleGuardar}>
          <div className="contenido-container">
            <p>
              Este flujo de caja refleja las operaciones, decisiones de inversión y financiación de la empresa.
              Completa los valores para cada año y revisa los indicadores al final.
            </p>

            <div className="estado-tabla-container">
              <table className="estado-tabla">
                <tbody>
                  {estructura.map((item, i) => (
                    <React.Fragment key={item.key || i}>
                      {item.tipo === "titulo" && (
                        <tr className="fila-titulo-seccion">
                          <td className="estado-concepto fila-aporte-adicional">{item.titulo}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda">{anio}</td>
                          ))}
                        </tr>
                      )}

                      {item.key && !item.indicador && item.tipo !== "punto_equilibrio" && (
                        <tr className={`estado-fila ${item.dark ? "fila-gray" : ""}`}>
                          <td className="estado-concepto">{item.label}</td>
                          {anios.map((anio) => (
                            <td key={anio} className="estado-celda">
                              <span className="estado-dato">
                                {valores.flujoCaja[item.key]?.[anio]
                                  ? valores.flujoCaja[item.key][anio].toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })
                                  : "$0"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      )}

                      {/* Bloque de indicadores */}
                      {item.key === "flujo_caja_bruto" && (
                        <tr>
                          <td colSpan={anios.length + 1}>
                            <div className="indicadores-wrapper">
                              <table className="indicadores-table">
                                <tbody>
                                  {indicadores.map((ind) => (
                                    <tr key={ind.key} className="indicador-row">
                                      <td className="estado-concepto celda-titulo-azul">{ind.label}</td>
                                      <td className="estado-celda-indicador">
                                        <CustomInput
                                          type={ind.type}
                                          value={valores.indicadores[ind.key] ?? 0}
                                          readOnly
                                        />
                                      </td>
                                      <td className="estado-celda-f">
                                        <span className="form-help">{ind.ayuda}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Bloque TIR inversionista */}
                      {item.tipo === "tir_inversionista" && (
                        <tr>
                          <td colSpan={anios.length + 1}>
                            <div className="bloque-inversionista">
                              <table className="tabla-inversionista">
                                <thead>
                                  <tr>
                                    <th className="celda-titulo-azul">TIR del inversionista</th>
                                    <th className="celda-titulo-azul">TMRR</th>
                                    <th className="celda-titulo-azul">TIR modificada del inversionista</th>
                                    <th className="celda-titulo-azul">VPN</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="celda-valor">
                                      {(valores.indicadores.tir_inversionista * 100).toFixed(2)}%
                                    </td>
                                    <td className="celda-valor">
                                      {(valores.indicadores.tmrr_inversionista * 100).toFixed(2)}%
                                    </td>
                                    <td className="celda-valor">
                                      {(valores.indicadores.tir_modificada_inversionista * 100).toFixed(2)}%
                                    </td>
                                    <td className="celda-valor">
                                      {valores.indicadores.vpn_inversionista.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Bloque Punto de Equilibrio */}
                      {item.tipo === "punto_equilibrio" && (
                        <tr>
                          <td colSpan={anios.length + 1}>
                            <div className="bloque-punto-equilibrio">
                              <div className="fila-imagen-centro">
                                <img src={tituloPuntoEqu} alt="Punto de Equilibrio" className="titulo-img-es-si" />
                              </div>
                              <table className="tabla-pe">
                                <thead>
                                  <tr>
                                    <th className="celda-titulo-naranja">Punto de Equilibrio</th>
                                    <th className="celda-titulo-naranja">2025</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>En unidades (costos fijos / PVU - CVU) Anual</td>
                                    <td>{valores.puntoEquilibrio.unidadesAnual.toLocaleString("es-CO")}</td>
                                  </tr>
                                  <tr>
                                    <td>En unidades (costos fijos / PVU - CVU) Mensual</td>
                                    <td>{valores.puntoEquilibrio.unidadesMensual.toLocaleString("es-CO")}</td>
                                  </tr>
                                  <tr>
                                    <td>En pesos (costos fijos / 1 - MCU) Anual</td>
                                    <td>{valores.puntoEquilibrio.pesosAnual.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                                  </tr>
                                  <tr>
                                    <td>En pesos (costos fijos / 1 - MCU) Mensual</td>
                                    <td>{valores.puntoEquilibrio.pesosMensual.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {item.tipo === "separador" && (
                        <tr><td colSpan={anios.length + 1} className="empty-row"></td></tr>
                      )}
                    </React.Fragment>
                  ))}
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
              <button className="nav-btn siguiente" type="button" onClick={() => navigate("/estadoResultados")}></button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default FlujoCaja;
