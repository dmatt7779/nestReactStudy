import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import cabezoteEgresos from "../../images/cabezote_egresos.png";
import tituloEgresos from "../../images/titulo_egresos.png";
import axiosClient from "../../utils/axios";

const CostosGastos = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- 1. ESTRUCTURA DE ESTADO BASE (REUTILIZADA) ---
    const [projectId, setProjectId] = useState(() => {
            return location.state?.projectId || sessionStorage.getItem('currentProjectId');
        })
    const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false); // Para saber si hacer POST o PUT
    const previousProjectId = useRef(null);

    const calculateYears = useCallback((year) => {
        const startYear = parseInt(year, 10);
        return Array.from({ length: 5 }, (_, i) => startYear + i);
    }, []);

    const [years, setYears] = useState(() => calculateYears(openingYear));

    // --- 2. ESTADOS ESPECÍFICOS PARA ESTA PANTALLA ---
    const [costos, setCostos] = useState([{ id: Date.now(), nombre: "", valor: "" }]);
    const [gastos, setGastos] = useState([{ id: Date.now(), nombre: "", valor: "" }]);
    const [opcionSeleccionadaEgresos, setOpcionSeleccionadaEgresos] = useState("");
    const [incrementoEgresos, setIncrementoEgresos] = useState(() => years.reduce((acc, year) => ({ ...acc, [year]: "" }), {}));

    // --- 3. USEEFFECT PARA CARGAR DATOS ---
    useEffect(() => {
        if (projectId) {
          sessionStorage.setItem('currentProjectId', projectId);
        }

        const fetchCostosGastos = async () => {
            if (!projectId) {
                setIsLoading(false);
                return;
            }
            
            // Evita recargar si el projectId no ha cambiado
            if (projectId === previousProjectId.current) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            // previousProjectId.current = projectId;

            try {
                const response = await axiosClient.get(`/api/v1/costos-gastos/${projectId}`);
                const data = response; // axiosClient ya devuelve el objeto de datos
                
                setDataExists(true); // Marcamos que los datos existen para hacer PUT luego

                // Cargar Costos Fijos
                if (data.costos && data.costos.length > 0) {
                    setCostos(data.costos.map((item, index) => ({ id: `costo-${index}`, nombre: item.nombre, valor: item.valor.toString() })));
                }

                // Cargar Gastos Administrativos
                if (data.gastos && data.gastos.length > 0) {
                    setGastos(data.gastos.map((item, index) => ({ id: `gasto-${index}`, nombre: item.nombre, valor: item.valor.toString() })));
                }


                // Cargar Incremento en Egresos
                if (data.incrementoEgresos) {
                    if (data.incrementoEgresos.pib) setOpcionSeleccionadaEgresos("PIB");
                    else if (data.incrementoEgresos.ipc) setOpcionSeleccionadaEgresos("IPC");
                    else if (data.incrementoEgresos.estrategia) setOpcionSeleccionadaEgresos("Estrategia");

                    if (data.incrementoEgresos.incrementoEgresosCantidades) {
                        const apiCantidades = data.incrementoEgresos.incrementoEgresosCantidades;
                        const newState = years.reduce((acc, year, index) => {
                            acc[year] = (index === 0) ? "" : (apiCantidades[index]?.toString() || "");
                            return acc;
                        }, {});
                        setIncrementoEgresos(newState);
                    }
                }

            } catch (costosGastosError) {
                if (costosGastosError.statusCode === 404) {
                    console.warn("No se encontraron datos de Costos y Gastos. Mostrando formulario vacío.");
                    setDataExists(false); // Marcamos que no existen para hacer POST
                    setCostos([{ id: Date.now(), nombre: "", valor: "" }]);
                    setGastos([{ id: Date.now(), nombre: "", valor: "" }]);
                    setOpcionSeleccionadaEgresos("");
                } else {
                    setError(costosGastosError.message || "Error al cargar los datos.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCostosGastos();
    }, [projectId, years]);

    // --- 4. MANEJADORES DE ESTADO (SIN CAMBIOS) ---
    const agregarCosto = () => setCostos([...costos, { id: Date.now(), nombre: "", valor: "" }]);
    const eliminarCosto = (id) => setCostos(costos.filter((c) => c.id !== id));
    const manejarCambioCosto = (id, campo, valor) => {
        setCostos(costos.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));
    };

    const agregarGasto = () => setGastos([...gastos, { id: Date.now(), nombre: "", valor: "" }]);
    const eliminarGasto = (id) => setGastos(gastos.filter((g) => g.id !== id));
    const manejarCambioGasto = (id, campo, valor) => {
        setGastos(gastos.map((g) => (g.id === id ? { ...g, [campo]: valor } : g)));
    };

    const manejarCambioEgresos = (e) => setOpcionSeleccionadaEgresos(e.target.value);
    const manejarCambioCrecEgresos = (anio, valor) => {
        setIncrementoEgresos((prev) => ({ ...prev, [anio]: valor }));
    };

    // --- 5. HANDLESUBMIT CON LÓGICA DE CREAR/ACTUALIZAR ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // Transformación de Estado de UI a Payload de API
        const dataToSend = {
            costos: costos.filter(c => c.nombre.trim() !== "").map(c => ({
                nombre: c.nombre.trim(),
                valor: parseFloat(c.valor) || 0,
            })),
            gastos: gastos.filter(g => g.nombre.trim() !== "").map(g => ({
                nombre: g.nombre.trim(),
                valor: parseFloat(g.valor) || 0,
            })),
            incrementoEgresos: {
                pib: opcionSeleccionadaEgresos === "PIB",
                ipc: opcionSeleccionadaEgresos === "IPC",
                estrategia: opcionSeleccionadaEgresos === "Estrategia",
                incrementoEgresosCantidades: years.map(year => parseFloat(incrementoEgresos[year]) || 0),
            }
        };

        console.log("Data to send:", JSON.stringify(dataToSend, null, 2));

        try {
            if (dataExists) {
                // Si los datos ya existían, actualizamos con PUT
                // await axiosClient.put(`/api/v1/costos-gastos/${projectId}`, dataToSend);
                console.log("Datos de Costos y Gastos actualizados.");
            } else {
                // Si no existían, creamos con POST
                await axiosClient.postcostosGastos(`/api/v1/costos-gastos/${projectId}`, dataToSend);
                console.log("Datos de Costos y Gastos creados.");
            }
            // Navegamos a la siguiente página si todo fue exitoso
            navigate('/activosFijos', { state: { projectId, openingYear } });

        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar los datos.");
            console.error("Error en handleSubmit:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    // --- 6. RENDERIZADO DEL JSX (CON PEQUEÑOS AJUSTES) ---
    return (
        <div className="project-info-container">
            <Navbar />
            <div className="white-container-n">
                <div className="robot-container-an">
                    <img src={cabezoteEgresos} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <div className="section">
                        <img src={tituloEgresos} alt="Análisis del entorno" className="section-img5" />
                    </div>
                    <p>Detalle los conceptos de costos fijos asociados al proyecto y el
                        valor mensual para el primer año. No incluya depreciación y gastos
                        financieros que serán proyectados en forma independiente.
                    </p>
                    <form onSubmit={handleSubmit}>
                        {/* Costos Fijos */}
                        <div className="proyeccion-container">
                            <h3>Costos fijos y valor mensual</h3>
                            <table className="tabla-estrategias">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="estrategia-celda-nombre">Concepto de costo fijo</th>
                                        <th>Valor mensual</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costos.map((costo, index) => (
                                        <tr key={costo.id}>
                                            <td>{index + 1}</td>
                                            <td className="estrategia-celda-nombre">
                                                <CustomInput value={costo.nombre} onChange={(value) => manejarCambioCosto(costo.id, "nombre", value)} />
                                            </td>
                                            <td>
                                                <CustomInput type="number" value={costo.valor} onChange={(value) => manejarCambioCosto(costo.id, "valor", value)} />
                                            </td>
                                            <td>
                                                <button type="button" className="estrategia-boton-eliminar" onClick={() => eliminarCosto(costo.id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="button" className="estrategia-boton-agregar" onClick={agregarCosto}>+ Agregar Costo Fijo</button>
                        </div>

                        <p>Detalle los conceptos de gastos administrativos (incluye los de administracion y ventas) asociados al proyecto y el valor mensual para el primer año. 
                           No incluya salarios, depreciación y gastos financieros que serán proyectados en forma independiente más debajo de esta plantilla
                        </p>
                        {/* Gastos Administrativos */}
                        <div className="proyeccion-container">
                            <h3>Gastos administrativos y valor mensual</h3>
                            <table className="tabla-estrategias">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="estrategia-celda-nombre">Concepto de gasto administrativo</th>
                                        <th>Valor mensual</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gastos.map((gasto, index) => (
                                        <tr key={gasto.id}>
                                            <td>{index + 1}</td>
                                            <td className="estrategia-celda-nombre">
                                                <CustomInput value={gasto.nombre} onChange={(value) => manejarCambioGasto(gasto.id, "nombre", value)} />
                                            </td>
                                            <td>
                                                <CustomInput type="number" value={gasto.valor} onChange={(value) => manejarCambioGasto(gasto.id, "valor", value)} />
                                            </td>
                                            <td>
                                                <button type="button" className="estrategia-boton-eliminar" onClick={() => eliminarGasto(gasto.id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="button" className="estrategia-boton-agregar" onClick={agregarGasto}>+ Agregar Gasto Administrativo</button>
                        </div>

                        <p>El crecimiento en COSTOS y GASTOS está representado en inflación
                           o en otro porcentaje establecido en el plan operativo.
                        </p>
                        {/* Crecimiento en Egresos */}
                        <div id="crecimiento-egresos" className="contenedor-crecimiento">
                            <CustomInput type="radio" value={opcionSeleccionadaEgresos} onChange={manejarCambioEgresos} options={["PIB", "Estrategia", "IPC"]} name="metodoIncrementoEgresos" />
                        </div>
                        {opcionSeleccionadaEgresos === "Estrategia" && (
                            <div id="incremento-egresos-estrategia">
                                <p className="texto-estrategia">
                                  En caso de que los gastos aumenten por otro porcentaje,
                                  ingrese manualmente el mismo por cada año.
                                </p>
                                <h3>Incremento en Egresos</h3>
                                <div className="fila-crecimiento">
                                    {years.map((anio, index) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput type="percentage" value={incrementoEgresos[anio]} onChange={(value) => manejarCambioCrecEgresos(anio, value)} disabled={index === 0} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="buttons-container">
                        <button type="button" className="nav-btn anterior" onClick={() => navigate(-1)}></button>
                        <button type="button" className="nav-btn siguiente" onClick={handleSubmit}></button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CostosGastos;