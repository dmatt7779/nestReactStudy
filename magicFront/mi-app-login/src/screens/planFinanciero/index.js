import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import cabezotePlanFin from "../../images/cabezote_plan_financiero.png";

const PlanFinanciero = () => {
    const navigate = useNavigate();

    const [datos, setDatos] = useState({
        disponibleInicial: 0,
        inventarioInicial: 0,
        financiacionPropia: 0,
        plazoCredito: 0,
        tasaCredito: 0,
        costoProveedores: 0,
        tmrr: 0,
        tasaReinversion: 0,
        tasaImpuestos: 0,
        diasCartera: 0,
        diasInventario: 0,
        diasProveedores: 0,
        tarifaIndCcio: 0,
        gmf: 0,
        saldoMinimoCaja: 0,
      });
    
      const manejarCambio = (campo, valor) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
      };
    
      const campos = [
        {
          nombre: "Disponible inicial",
          id: "disponibleInicial",
          tipo: "number",
          descripcion: "Ingrese los meses de capital de trabajo estimados que necesita reservar al inicio del proyecto (Mientras el negocio empiece a dar Ingresos)"
        },
        {
          nombre: "Inventario inicial",
          id: "inventarioInicial",
          tipo: "number",
          descripcion: "En caso de tener inventario, ingrese los días de inventario inicial para el proyecto (Cuidado si los productos son Perecederos)"
        },
        {
          nombre: "Financiación propia",
          id: "financiacionPropia",
          tipo: "number",
          descripcion: "Del total de la inversión necesaria, ingrese cuanto dinero se dispondrá como capital propio (en pesos colombianos)"
        },
        {
          nombre: "Plazo del crédito",
          id: "plazoCredito",
          tipo: "number",
          descripcion: "Ingrese el plazo de una línea de crédito en meses. No debe ser mayor al período de evaluación"
        },
        {
          nombre: "Tasa del crédito",
          id: "tasaCredito",
          tipo: "percentage",
          descripcion: "Ingrese la tasa de interés Efectiva Anual estimada para el préstamo"
        },
        {
          nombre: "Costo proveedores",
          id: "costoProveedores",
          tipo: "percentage",
          descripcion: "Ingrese el costo financiero de los proveedores (costo de financiación por parte de proveedores) si existe"
        },
        {
          nombre: "TMRR o COK",
          id: "tmrr",
          tipo: "percentage",
          descripcion: "Ingrese la Tasa Anual mínima de rentabilidad requerida para el accionista (También se denomina Costo de Oportunidad de Capital)"
        },
        {
          nombre: "Tasa de Reinversión",
          id: "tasaReinversion",
          tipo: "percentage",
          descripcion: "Ingrese la Tasa Anual estimada de rentabilidad que espera tener en la inversión diversificada de excedentes de tesorería (Se sugiere la tasa de un CDT)"
        },
        {
          nombre: "Tasa impuestos",
          id: "tasaImpuestos",
          tipo: "percentage",
          descripcion: "Ingrese la Tasa Anual del Impuesto de Renta estipulada por la DIAN para los próximos años"
        },
        {
          nombre: "Días cartera",
          id: "diasCartera",
          tipo: "number",
          descripcion: "Determine la política de días de cartera o recuperación de ventas a crédito"
        },
        {
          nombre: "Días inventario",
          id: "diasInventario",
          tipo: "number",
          descripcion: "Determine la política de días de inventarios y su rotación en caso de que aplique (Cuidado si los productos son Perecederos)"
        },
        {
          nombre: "Días proveedores",
          id: "diasProveedores",
          tipo: "number",
          descripcion: "Determine la política de días de pago a proveedores"
        },
        {
          nombre: "Tarifa Ind y Ccio",
          id: "tarifaIndCcio",
          tipo: "percentage",
          descripcion: "Ingrese la Tarifa de Impuesto de Industria y Comercio (%) para la actividad que desarrolla. Por ejemplo, para el 10 x mil, digite 1"
        },
        {
          nombre: "GMF",
          id: "gmf",
          tipo: "percentage",
          descripcion: "Ingrese la Tarifa de Gravamen (%) de Movimiento Financiero. Por ejemplo, el 7 x mil, digite 0.7"
        },
        {
          nombre: "Saldo mínimo caja",
          id: "saldoMinimoCaja",
          tipo: "number",
          descripcion: "Ingrese el valor estimado del Saldo mínimo de efectivo (Caja Menor) para cubrir la operación normal de uno (1) a dos (2) meses"
        }
      ];

      //Arrays para inversión activos y reparto de dividendos//

    const [inversionActivos, setInversionActivos] = useState([0, 0, 0, 0, 0]); // 2025 - 2029
    const [repartoDividendos, setRepartoDividendos] = useState([0, 0, 0, 0]); // 2026 - 2029

    const actualizarArray = (index, valor, tipo) => {
        const nuevoValor = parseFloat(valor) || 0;
        if (tipo === "inversion") {
          const actualizado = [...inversionActivos];
          actualizado[index] = nuevoValor;
          setInversionActivos(actualizado);
        } else if (tipo === "dividendos") {
          const actualizado = [...repartoDividendos];
          actualizado[index] = nuevoValor;
          setRepartoDividendos(actualizado);
        }
      };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezotePlanFin} alt="Robot" className="robot-img-p" />
        </div>
        <div className="contenido-container-p">
          <p>
          Una vez cuantificados los ingresos, costos, gastos e inversión, se requiere información complementaria para elaborar el plan financiero, 
          como son políticas, tasas, impuestos y otros datos. Ingrese cada dato teniendo en cuenta las estrategias para el desarrollo del proyecto.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="formulario-datos">
            {campos.map(({ nombre, id, tipo, descripcion }) => (
            <div key={id} className="bloque-dato">
                <div className="bloque-info">
                <label htmlFor={id} className="titulo-dato">
                    {nombre}
                </label>
                <p className="descripcion-dato">{descripcion}</p>
                </div>
                <div className="input-wrapper">
                <CustomInput
                    id={id}
                    type={tipo}
                    value={datos[id]}
                    onChange={(valor) => manejarCambio(id, valor)}
                />
                </div>
            </div>
            ))}
            </div>

            {/* Arrays para inversión activos y reparto de dividendos*/}
            <div className="tabla-plan-financiero">
                <h3>PROPUESTA</h3>
                <div className="tabla-subseccion">
                    <p><strong>Porcentaje de Ejecución de la Inversión Inicial (Debe totalizar 100%)</strong></p>
                    <div className="fila-crecimiento">
                    {["Ejecución Inversión Activos Fijos", "Año 2025", "Año 2026", "Año 2027", "Año 2028", "Año 2029"].map((anio, i) => (
                        <div key={i} className="celda">
                        <label>{anio}</label>
                        {i > 0 && (
                            <CustomInput
                            type="percentage"
                            value={inversionActivos[i - 1]}
                            onChange={(v) => actualizarArray(i - 1, v, "inversion")}
                            className="contenedor-input"
                            />
                        )}
                        </div>
                    ))}
                    </div>
                    <p>
                    La suma debe totalizar 100%. Total actual: <strong>{inversionActivos.reduce((a, b) => a + b, 0)}%</strong>
                    </p>
                </div>

                <div className="tabla-subseccion">
                    <p><strong>Política de Reparto de Dividendos según el Porcentaje de la Utilidad Neta</strong></p>
                    <div className="fila-crecimiento">
                    {["Año 2025", "Año 2026", "Año 2027", "Año 2028", "Año 2029"].map((anio, i) => (
                        <div key={i} className="celda">
                        <label>{anio}</label>
                        {i === 0 ? (
                            <input disabled className="input-disabled" />
                        ) : (
                            <CustomInput
                            type="percentage"
                            value={repartoDividendos[i - 1]}
                            onChange={(v) => actualizarArray(i - 1, v, "dividendos")}
                            className="contenedor-input"
                            />
                        )}
                        </div>
                    ))}
                    </div>
                    <p>
                    Los porcentajes no pueden superar el 100%. Total actual: <strong>{repartoDividendos.reduce((a, b) => a + b, 0)}%</strong>
                    </p>
                </div>
                <h3>NOTA:</h3>
                <p>Financiación Adicional de Capital de Trabajo (PQC).
                En caso que su proyecto de como resultado pérdidas en algunos períodos de tiempo (años), los dueños deberán asumir los compromisos deficitarios
                </p>
                </div>
            </form>
            
          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/newProject")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanFinanciero;
