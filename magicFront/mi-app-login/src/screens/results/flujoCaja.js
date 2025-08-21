import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import tituloFlujoCaja from "../../images/titulo_flujo_caja.png";
import tituloComentarios from "../../images/titulo_comentarios.png";
import { DownloadCloud } from "lucide-react";

const FlujoCaja = () => {
  const navigate = useNavigate();

  const anios = [2025, 2026, 2027, 2028, 2029];

  const estructura = [
    { tipo: "titulo", titulo: "Concepto" },
    { tipo: "separador" },                  
    // --- Bloque operativo ---
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

       // --- Bloque indicadores ---
    { label: "TIR del proyecto", key: "tir_proyecto", indicador: true },
    { label: "TMRR o COK", key: "tmrr_cok", indicador: true },
    { label: "TIR Modificada del proyecto", key: "tir_modificada", indicador: true },
    { label: "VPN del proyecto (TMRR)", key: "tmrr", indicador: true },
    { tipo: "separador" }, 

     // --- Bloque capital de trabajo e inversión ---
    { label: "Reposición de Capital de Trabajo Neto Operativo (KTNO)", key: "ktno" },
    { label: "Escudo Fiscal", key: "escudo" },
    { tipo: "separador" },          
   
    // --- Bloque deuda y socios ---
    { label: "Servicio de la deuda", key: "servicio_deuda" },
    { label: "Gastos financieros", key: "gastos_fin" },
    { label: "Aportes Inicial de capital por Socios", key: "aportes_ini" },
    { label: "Aporte ADICIONAL de capital por Socios", key: "aportes_adi" },
    { label: "Cuenta por Pagar a Socios", key: "cuentas_pagar" },
    { tipo: "separador" }, 
    { label: "Flujo de caja libre inversionista", key: "flujo_accionista", dark: true },
    { tipo: "separador" }, 

       // --- Bloque indicadores ---
    { label: "TIR del inversionista", key: "tir_inv", indicador: true },
    { label: "TMRR", key: "tmrr", indicador: true },
    { label: "TIR Modificada del inversionista", key: "tir_modificada", indicador: true },
    { label: "VPN", key: "vpn", indicador: true },
    
  ];

  const [valores, setValores] = useState(
    estructura.reduce((acc, item) => {
      if (!item.key) return acc;
      if (item.indicador) {
        acc[item.key] = ""; // valores únicos
      } else {
        acc[item.key] = anios.reduce((a, anio) => ({ ...a, [anio]: "" }), {});
      }
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
                          {anios.map((anio, index) => (
                            <td key={index} className="estado-celda">{anio}</td>
                          ))}
                        </tr>
                      )}

                      {item.key && !item.indicador && (
                        <tr
                          className={`estado-fila ${
                            item.dark ? "fila-black" : ""
                          }`}
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

                      {item.key && item.indicador && (
                        <tr className="estado-fila fila-blue">
                          <td className="estado-concepto">{item.label}</td>
                          <td colSpan={anios.length} className="estado-celda">
                            <span className="estado-dato">
                              {valores[item.key] || "0"}
                            </span>
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
                  id="ana-flujo-caja"
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
