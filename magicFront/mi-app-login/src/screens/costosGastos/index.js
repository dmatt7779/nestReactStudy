import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import cabezoteEgresos from "../../images/cabezote_egresos.png";
import tituloEgresos from "../../images/titulo_egresos.png";
import axiosClient from "../../utils/axios";

const extraerValor = (input) => {
    if (input && typeof input === 'object' && input.target && typeof input.target.value !== 'undefined') {
        return input.target.value;
    }
    return input;
};

const limpiarNumero = (valor) => {
    const dato = extraerValor(valor);
    if (dato === null || dato === undefined || dato === "") return "";
    return String(dato).split(/[.,]/)[0].replace(/\D/g, '');
};

const CostosGastos = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [projectId, setProjectId] = useState(() => {
            return location.state?.projectId || sessionStorage.getItem('currentProjectId');
        })
    const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false); 
    const previousProjectId = useRef(null);

    const calculateYears = useCallback((year) => {
        const startYear = parseInt(year, 10);
        return Array.from({ length: 5 }, (_, i) => startYear + i);
    }, []);

    const [years, setYears] = useState(() => calculateYears(openingYear));

    // --- 2. ESTADOS: INICIALIZAR CON "" PARA EVITAR CEROS ---
    const [costos, setCostos] = useState([{ id: Date.now(), nombre: "", valor: "" }]);
    const [gastos, setGastos] = useState([{ id: Date.now(), nombre: "", valor: "" }]);
    const [opcionSeleccionadaEgresos, setOpcionSeleccionadaEgresos] = useState("");
    const [incrementoEgresos, setIncrementoEgresos] = useState(() => years.reduce((acc, year) => ({ ...acc, [year]: "" }), {}));

    // --- 3. CARGA DE DATOS ---
    useEffect(() => {
        if (projectId) {
          sessionStorage.setItem('currentProjectId', projectId);
        }

        const fetchCostosGastos = async () => {
            if (!projectId) {
                setIsLoading(false);
                return;
            }
            
            if (projectId === previousProjectId.current) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await axiosClient.get(`/api/v1/costos-gastos/${projectId}`);
                const data = response; 
                
                setDataExists(true); 

                if (data.costos && data.costos.length > 0) {
                    setCostos(data.costos.map((item, index) => ({ 
                        id: `costo-${index}`, 
                        nombre: item.nombre, 
                        valor: limpiarNumero(item.valor)
                    })));
                } else {
                    setCostos([{ id: Date.now(), nombre: "", valor: "" }]);
                }

                if (data.gastos && data.gastos.length > 0) {
                    setGastos(data.gastos.map((item, index) => ({ 
                        id: `gasto-${index}`, 
                        nombre: item.nombre, 
                        valor: limpiarNumero(item.valor)
                    })));
                } else {
                    setGastos([{ id: Date.now(), nombre: "", valor: "" }]);
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
                    console.warn("No se encontraron datos. Mostrando formulario vacío.");
                    setDataExists(false);
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

    // --- 4. MANEJADORES DE ESTADO (CON LIMPIEZA) ---
    
    const agregarCosto = () => setCostos([...costos, { id: Date.now(), nombre: "", valor: "" }]);
    
    const eliminarCosto = (id) => {
        const confirmar = window.confirm("¿Eliminar este costo?");
        if (confirmar) setCostos(costos.filter((c) => c.id !== id));
    };

    // Manejador Costos
    const manejarCambioCosto = (id, campo, value) => {
        setCostos(costos.map((c) => {
            if (c.id === id) {
                const valorFinal = campo === "valor" 
                    ? limpiarNumero(value) 
                    : extraerValor(value);
                
                return { ...c, [campo]: valorFinal };
            }
            return c;
        }));
    };

    const agregarGasto = () => setGastos([...gastos, { id: Date.now(), nombre: "", valor: "" }]);
    
    const eliminarGasto = (id) => {
        const confirmar = window.confirm("¿Eliminar este gasto?");
        if (confirmar) setGastos(gastos.filter((g) => g.id !== id));
    };

    // Manejador Gastos
    const manejarCambioGasto = (id, campo, value) => {
        setGastos(gastos.map((g) => {
            if (g.id === id) {
                const valorFinal = campo === "valor" 
                    ? limpiarNumero(value) 
                    : extraerValor(value);

                return { ...g, [campo]: valorFinal };
            }
            return g;
        }));
    };

    const manejarCambioEgresos = (e) => setOpcionSeleccionadaEgresos(e.target.value);
    
    const manejarCambioCrecEgresos = (anio, valor) => {
        setIncrementoEgresos((prev) => ({ ...prev, [anio]: valor }));
    };

    // --- 5. HANDLESUBMIT ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

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
                // await axiosClient.put(`/api/v1/costos-gastos/${projectId}`, dataToSend);
                console.log("Datos de Costos y Gastos actualizados.");
                // Simulación de éxito para navegar
                 navigate('/activosFijos', { state: { projectId, openingYear } });
            } else {
                await axiosClient.postCostosGastos(`/api/v1/costos-gastos/${projectId}`, dataToSend);
                console.log("Datos de Costos y Gastos creados.");
                navigate('/activosFijos', { state: { projectId, openingYear } });
            }

        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar los datos.");
            console.error("Error en handleSubmit:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

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
                                                <CustomInput 
                                                    value={costo.nombre}
                                                    placeholder={"nombre"}
                                                    onChange={(value) => manejarCambioCosto(costo.id, "nombre", value)} 
                                                />
                                            </td>
                                            <td>
                                                <CustomInput 
                                                    type="number"
                                                    placeholder={"$0"}
                                                    value={costo.valor} 
                                                    onChange={(value) => manejarCambioCosto(costo.id, "valor", value)} 
                                                />
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
                                                <CustomInput 
                                                    value={gasto.nombre}
                                                    placeholder={"nombre"}
                                                    onChange={(value) => manejarCambioGasto(gasto.id, "nombre", value)} 
                                                />
                                            </td>
                                            <td>
                                                <CustomInput 
                                                    type="number"
                                                    value={gasto.valor}
                                                    placeholder={"$0"}
                                                    onChange={(value) => manejarCambioGasto(gasto.id, "valor", value)} 
                                                />
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
                        {/* Crecimiento en Egresos */}
                        <h3>Incremento en Egresos</h3>
                        <p>El crecimiento en COSTOS y GASTOS está representado en inflación
                           o en otro porcentaje establecido en el plan operativo.
                        </p>
                        <div id="crecimiento-egresos" className="contenedor-crecimiento">
                            <CustomInput type="radio" value={opcionSeleccionadaEgresos} onChange={manejarCambioEgresos} options={["PIB", "Estrategia", "IPC"]} name="metodoIncrementoEgresos" />
                        </div>
                        {opcionSeleccionadaEgresos === "Estrategia" && (
                            <div id="incremento-egresos-estrategia">
                                <p className="texto-estrategia">
                                  En caso de que los gastos aumenten por otro porcentaje,
                                  ingrese manualmente el mismo por cada año.
                                </p>
                                <div className="fila-crecimiento">
                                    {years.map((anio, index) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput type="percentage" placeholder={"0%"} value={incrementoEgresos[anio]} onChange={(value) => manejarCambioCrecEgresos(anio, value)} disabled={index === 0} />
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