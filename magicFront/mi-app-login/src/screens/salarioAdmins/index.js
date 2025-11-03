import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteSalarios from "../../images/cabezote_salario_admins.png";
import axiosClient from "../../utils/axios";

const SalarioAdmins = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- 1. ESTRUCTURA DE ESTADO BASE (REUTILIZADA) ---
    const [projectId, setProjectId] = useState(() => location.state?.projectId || sessionStorage.getItem('currentProjectId'));
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

    // --- 2. ESTADOS ESPECÍFICOS PARA ESTA PANTALLA ---
    // Unificamos los nombres para que coincidan con la API: cargo, valorMensual
    const [cargos, setCargos] = useState([{ id: Date.now(), cargo: "", valorMensual: "" }]);
    const [opcionSeleccionadaSalarios, setOpcionSeleccionadaSalarios] = useState("");
    const [incrementoSalarios, setIncrementoSalarios] = useState(() => years.reduce((acc, year) => ({ ...acc, [year]: "" }), {}));

    // --- 3. USEEFFECT PARA CARGAR DATOS ---
    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem('currentProjectId', projectId);
        }

        const fetchSalarioAdmins = async () => {
            if (!projectId) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            previousProjectId.current = projectId;

            try {
                const response = await axiosClient.get(`/api/v1/salario-admins/${projectId}`);
                const data = response.salarioAdmins;
                
                setDataExists(true);

                if (data.salarioAdmins && data.salarioAdmins.length > 0) {
                    setCargos(data.salarioAdmins.map((item, index) => ({
                        id: `api-cargo-${index}`,
                        cargo: item.cargo,
                        valorMensual: item.valorMensual.toString(),
                    })));
                }

                if (data.incrementoSalarial) {
                    if (data.incrementoSalarial.ipc) setOpcionSeleccionadaSalarios("IPC");
                    else if (data.incrementoSalarial.otroPorcentaje) setOpcionSeleccionadaSalarios("Otro Porcentaje");

                    if (data.incrementoSalarial.incrementoEgresos) {
                        const apiCantidades = data.incrementoSalarial.incrementoEgresos;
                        const newState = years.reduce((acc, year, index) => {
                            acc[year] = (index === 0) ? "" : (apiCantidades[index]?.toString() || "");
                            return acc;
                        }, {});
                        setIncrementoSalarios(newState);
                    }
                }

            } catch (salarioAdminsError) {
                if (salarioAdminsError.statusCode === 404) {
                    console.warn("No se encontraron datos de SalarioAdmins. Mostrando formulario vacío.");
                    setDataExists(false);
                    setCargos([{ id: Date.now(), cargo: "", valorMensual: ""}]);
                    setOpcionSeleccionadaSalarios("");
                } else {
                    setError(salarioAdminsError.message || "Error al cargar los datos.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalarioAdmins();
    }, [projectId, years]);

    const agregarCargo = () => {
        setCargos([...cargos, { id: Date.now(), cargo: "", valorMensual: ""}]);
    };

    const eliminarCargo = (id) => {
        if (window.confirm("¿Está seguro de eliminar este cargo?")) {
            setCargos(cargos.filter((cargo) => cargo.id !== id));
        }
    };

    const manejarCambioCargo = (id, campo, valor) => {
        setCargos((prev) =>
            prev.map((cargo) => (cargo.id === id ? { ...cargo, [campo]: valor } : cargo))
        );
    };

    const manejarCambioSalarios = (e) => setOpcionSeleccionadaSalarios(e.target.value);
    const manejarCambioCrecSalarios = (anio, valor) => {
        setIncrementoSalarios((prev) => ({ ...prev, [anio]: valor }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const dataToSend = {
            salarioAdmins: cargos
                .filter(c => c.cargo.trim() !== "")
                .map(c => ({
                    cargo: c.cargo.trim(),
                    valorMensual: parseFloat(c.valorMensual) || 0,
                })),
            incrementoSalarial: {
                ipc: opcionSeleccionadaSalarios === "IPC",
                otroPorcentaje: opcionSeleccionadaSalarios === "Otro Porcentaje",
                incrementoEgresos: years.map(year => parseFloat(incrementoSalarios[year]) || 0),
            }
        };

        console.log("Data to send:", JSON.stringify(dataToSend, null, 2));

        try {
            if (dataExists) {
                // await axiosClient.put(`/api/v1/salario-admins/${projectId}`, dataToSend);
                console.log("Datos de Salario Admins actualizados.");
            } else {
                await axiosClient.postSalarioAdmins(`/api/v1/salario-admins/${projectId}`, dataToSend);
            }
            navigate('/planFinanciero', { state: { projectId, openingYear } });
        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar los datos.");
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
                    <img src={cabezoteSalarios} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <p>Una vez determinadas las necesidades de personal...</p>
                    <form onSubmit={handleSubmit}>
                        <div className="proyeccion-container">
                            <h3>Cargos y valor mensual</h3>
                            <p>Recuerde incluir prestaciones...</p>
                            <table className="tabla-estrategias">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="estrategia-celda-nombre">Cargo</th>
                                        <th>Valor mensual</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargos.map((cargo, index) => (
                                        <tr key={cargo.id}>
                                            <td>{index + 1}</td>
                                            <td className="estrategia-celda-nombre">
                                                <CustomInput value={cargo.cargo} onChange={(value) => manejarCambioCargo(cargo.id, "cargo", value)} />
                                            </td>
                                            <td>
                                                <CustomInput type="number" value={cargo.valorMensual} onChange={(value) => manejarCambioCargo(cargo.id, "valorMensual", value)} />
                                            </td>
                                            <td>
                                                <button type="button" className="estrategia-boton-eliminar" onClick={() => eliminarCargo(cargo.id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="button" className="estrategia-boton-agregar" onClick={agregarCargo}>+ Agregar Nuevo Cargo</button>
                        </div>
                        <p>El incremento en SALARIOS cada año...</p>
                        <div id="crecimiento-salario" className="contenedor-crecimiento">
                            <CustomInput type="radio" value={opcionSeleccionadaSalarios} onChange={manejarCambioSalarios} options={["IPC", "Otro Porcentaje"]} name="metodoIncrementoSalarios" />
                        </div>
                        {opcionSeleccionadaSalarios === "Otro Porcentaje" && (
                            <div id="incremento-salarios">
                                <p className="texto-estrategia">En caso de ser otro porcentaje...</p>
                                <h3>Incremento en Salarios</h3>
                                <div className="fila-crecimiento">
                                    {years.map((anio, index) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput type="percentage" value={incrementoSalarios[anio]} onChange={(value) => manejarCambioCrecSalarios(anio, value)} disabled={index === 0} />
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

export default SalarioAdmins;