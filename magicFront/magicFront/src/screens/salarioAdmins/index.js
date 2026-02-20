import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
import cabezoteSalarios from "../../images/cabezote_salario_admins.png";
import axiosClient from "../../utils/axios";

// --- 1. FUNCIONES AUXILIARES ---

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

const SalarioAdmins = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [projectId, setProjectId] = useState(() => location.state?.projectId || sessionStorage.getItem('currentProjectId'));
    const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());
    
    const [isLoading, setIsLoading] = useState(true);
    const { isProcessing, runWithLoader } = useProcessing();
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false);
    const previousProjectId = useRef(null);

    // Nuevo estado para la validación
    const [formularioCompleto, setFormularioCompleto] = useState(false);

    const calculateYears = useCallback((year) => {
        const startYear = parseInt(year, 10);
        return Array.from({ length: 5 }, (_, i) => startYear + i);
    }, []);

    const [years, setYears] = useState(() => calculateYears(openingYear));

    // --- 2. ESTADOS ---
    const [cargos, setCargos] = useState([{ id: Date.now(), cargo: "", valorMensual: "" }]);
    const [opcionSeleccionadaSalarios, setOpcionSeleccionadaSalarios] = useState("");
    const [incrementoSalarios, setIncrementoSalarios] = useState(() => years.reduce((acc, year) => ({ ...acc, [year]: "" }), {}));

    // --- NUEVO: EFECTO DE VALIDACIÓN ---
    useEffect(() => {
        // 1. Validar Cargos: Al menos uno, y todos completos
        const cargosValidos = cargos.length > 0 && cargos.every(c => 
            c.cargo.trim() !== "" && String(c.valorMensual).trim() !== ""
        );

        // 2. Validar Incremento Salarial
        let incrementoValido = false;
        if (opcionSeleccionadaSalarios === "IPC") {
            incrementoValido = true;
        } else if (opcionSeleccionadaSalarios === "Otro Porcentaje") {
            // Validar años del 2 al 5 (el primero suele estar deshabilitado o vacío por defecto)
            incrementoValido = years.slice(1).every(year => 
                incrementoSalarios[year] !== "" && incrementoSalarios[year] !== undefined
            );
        }

        setFormularioCompleto(cargosValidos && incrementoValido);

    }, [cargos, opcionSeleccionadaSalarios, incrementoSalarios, years]);

    // --- 3. CARGA DE DATOS ---
    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem('currentProjectId', projectId);
        }

        const fetchSalarioAdmins = async () => {
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
                const response = await axiosClient.get(`/api/v1/salario-admins/${projectId}`);
                const data = response.salarioAdmins;
                
                setDataExists(true);

                if (data.salarioAdmins && data.salarioAdmins.length > 0) {
                    setCargos(data.salarioAdmins.map((item, index) => ({
                        id: `api-cargo-${index}`,
                        cargo: item.cargo,
                        valorMensual: limpiarNumero(item.valorMensual),
                    })));
                } else {
                    setCargos([{ id: Date.now(), cargo: "", valorMensual: ""}]);
                }

                if (data.incrementoSalarial) {
                    if (data.incrementoSalarial.ipc) setOpcionSeleccionadaSalarios("IPC");
                    else if (data.incrementoSalarial.otroPorcentaje) setOpcionSeleccionadaSalarios("Otro Porcentaje");

                    if (data.incrementoSalarial.incrementoEgresos) {
                        const apiCantidades = data.incrementoSalarial.incrementoEgresos;
                        const newState = years.reduce((acc, year, index) => {
                            const val = apiCantidades[index];
                            if (index === 0 || val === 0 || val === null || val === undefined) {
                                acc[year] = "";
                            } else {
                                acc[year] = val.toString();
                            }
                            return acc;
                        }, {});
                        setIncrementoSalarios(newState);
                    }
                }

            } catch (salarioAdminsError) {
                if (salarioAdminsError.statusCode === 404) {
                    console.warn("No se encontraron datos. Mostrando formulario vacío.");
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

    // --- 4. MANEJADORES ---

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
            prev.map((cargo) => {
                if (cargo.id === id) {
                    const valorFinal = campo === "valorMensual" 
                        ? limpiarNumero(valor) 
                        : extraerValor(valor);
                    
                    return { ...cargo, [campo]: valorFinal };
                }
                return cargo;
            })
        );
    };

    const manejarCambioSalarios = (e) => setOpcionSeleccionadaSalarios(e.target.value);
    
    const manejarCambioCrecSalarios = (anio, valor) => {
        setIncrementoSalarios((prev) => ({ ...prev, [anio]: extraerValor(valor) }));
    };

    const handleGoBack = async () => {
        await runWithLoader(async () => {});
        navigate(-1);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        let navTarget = null;

        await runWithLoader(async () => {
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
                    console.log("Datos de Salario Admins actualizados.");
                } else {
                    await axiosClient.postSalarioAdmins(`/api/v1/salario-admins/${projectId}`, dataToSend);
                }
                navTarget = { path: '/planFinanciero', state: { projectId, openingYear } };
            } catch (err) {
                setError(err.message || "Ocurrió un error al guardar los datos.");
            }
        });
        if (navTarget) navigate(navTarget.path, { state: navTarget.state });
    };

    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="project-info-container">
            {isProcessing && <CeipaLoader />}
            <Navbar />
            <div className="white-container-n">
                <div className="robot-container-an">
                    <img src={cabezoteSalarios} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <p>Una vez determinadas las necesidades de personal...</p>
                    
                    {/* Formulario con validación en onSubmit (opcional, ya que el botón se deshabilita) */}
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        
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
                                                <CustomInput 
                                                    value={cargo.cargo} 
                                                    placeholder={"Nombre del cargo"} 
                                                    onChange={(value) => manejarCambioCargo(cargo.id, "cargo", value)} 
                                                />
                                            </td>
                                            <td>
                                                <CustomInput 
                                                    type="number"
                                                    value={cargo.valorMensual} 
                                                    placeholder={"$0"} 
                                                    onChange={(value) => manejarCambioCargo(cargo.id, "valorMensual", value)} 
                                                />
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

                        <h3>Incremento en Salarios</h3>
                        <p>El incremento en SALARIOS cada año...</p>
                        <div id="crecimiento-salario" className="contenedor-crecimiento">
                            <CustomInput type="radio" value={opcionSeleccionadaSalarios} onChange={manejarCambioSalarios} options={["IPC", "Otro Porcentaje"]} name="metodoIncrementoSalarios" />
                        </div>
                        
                        {opcionSeleccionadaSalarios === "Otro Porcentaje" && (
                            <div id="incremento-salarios">
                                <p className="texto-estrategia">En caso de ser otro porcentaje...</p>
                                <div className="fila-crecimiento">
                                    {years.map((anio, index) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput 
                                                type="percentage" 
                                                value={incrementoSalarios[anio]} 
                                                placeholder={"0%"} 
                                                onChange={(value) => manejarCambioCrecSalarios(anio, value)} 
                                                disabled={index === 0} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                    
                    {/* Botón con Validación */}
                    <div className="buttons-container">
                        <button type="button" className="nav-btn anterior" onClick={handleGoBack}></button>
                        <button 
                            type="button" 
                            className="nav-btn siguiente" 
                            onClick={handleSubmit}
                            disabled={!formularioCompleto}
                            style={{
                                opacity: formularioCompleto ? 1 : 0.5,
                                cursor: formularioCompleto ? 'pointer' : 'not-allowed'
                            }}
                        ></button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SalarioAdmins;