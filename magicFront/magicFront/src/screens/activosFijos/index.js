import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
import cabezoteActivos from "../../images/cabezote_activos_fijos.png";
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
    const cleaned = String(dato).replace(/[^0-9.\-]/g, '') || "0";
    return cleaned;
};

const SECCIONES = [
  { id: "muebles", nombre: "Muebles y enseres", campos: ["vidaUtil", "valorSalvamento"], apiKey: "mueblesEnseres" },
  { id: "maquinaria", nombre: "Maquinaria y equipos", campos: ["vidaUtil", "valorSalvamento"], apiKey: "maquinariaEquipos" },
  { id: "vehiculos", nombre: "Vehículos", campos: ["vidaUtil", "valorSalvamento"], apiKey: "vehiculos" },
  { id: "terrenos", nombre: "Terrenos", campos: [], apiKey: "terrenos" },
  { id: "edificaciones", nombre: "Edificaciones", campos: ["vidaUtil", "valorSalvamento"], apiKey: "edificaciones" },
  { id: "computo", nombre: "Equipos de cómputo", campos: ["vidaUtil", "valorSalvamento"], apiKey: "equiposComputo" },
  { id: "intangibles", nombre: "Activos Diferidos (Software e intangibles)", campos: ["vidaUtil"], apiKey: "activosDiferidos" },
];

const getInitialState = () => Object.fromEntries(
  SECCIONES.map(({ id }) => [
      id, 
      { 
          vidaUtil: "", 
          valorSalvamento: "", 
          items: [{ id: Date.now(), nombre: "", valor: "" }] 
      }
  ])
);

const ActivosFijos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [projectId, setProjectId] = useState(() => {return location.state?.projectId || sessionStorage.getItem('currentProjectId')});
    const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());
    const [isLoading, setIsLoading] = useState(true);
    const { isProcessing, runWithLoader } = useProcessing();
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false);
    const [secciones, setSecciones] = useState(getInitialState);

    // Estado para controlar la validación del formulario
    const [formularioCompleto, setFormularioCompleto] = useState(false);

    // --- LÓGICA DE VALIDACIÓN INTELIGENTE ---
    useEffect(() => {
        let totalItemsValidos = 0;
        let hayErrores = false;

        SECCIONES.forEach((config) => {
            const data = secciones[config.id];
            
            // Revisamos si esta sección tiene items "activos" (con algún dato escrito)
            let itemsActivosEnSeccion = 0;

            data.items.forEach(item => {
                const tieneNombre = item.nombre.trim() !== "";
                const tieneValor = String(item.valor).trim() !== "";

                if (tieneNombre || tieneValor) {
                    // Si el usuario escribió algo, DEBE completar ambos campos
                    if (tieneNombre && tieneValor) {
                        totalItemsValidos++; // Cuenta como item válido global
                        itemsActivosEnSeccion++;
                    } else {
                        hayErrores = true; // Item a medias = Error
                    }
                }
                // Si ambos están vacíos, ignoramos la fila (no es error, pero no suma)
            });

            // Si hay al menos un item activo en esta sección, validamos los campos globales
            if (itemsActivosEnSeccion > 0) {
                const vidaUtilOk = !config.campos.includes("vidaUtil") || (data.vidaUtil != null && String(data.vidaUtil).trim() !== "");
                const salvamentoOk = !config.campos.includes("valorSalvamento") || (data.valorSalvamento != null && String(data.valorSalvamento).trim() !== "");

                if (!vidaUtilOk || !salvamentoOk) {
                    hayErrores = true; // Faltan datos globales de la sección
                }
            }
        });

        // El formulario es válido si no hay errores parciales Y hay al menos 1 item completo en total
        setFormularioCompleto(!hayErrores && totalItemsValidos > 0);

    }, [secciones]);

    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem('currentProjectId', projectId);
        }

        const fetchActivosFijos = async () => {
            if (!projectId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const response = await axiosClient.get(`/api/v1/activos-fijos/${projectId}`);
                const data = response.activosFijos;
                setDataExists(true);
                const newState = getInitialState();
                
                SECCIONES.forEach(({ id, apiKey }) => {
                    if (data[apiKey]) {
                        const sectionDataApi = data[apiKey];
                        
                        const itemsCargados = (sectionDataApi.items || []).map((item, index) => ({
                            id: `api-item-${id}-${index}`,
                            nombre: item.nombre || "",
                            valor: limpiarNumero(item.valor),
                        }));

                        // Si no hay items, dejamos uno vacío para que se vea el input
                        if (itemsCargados.length === 0) {
                            itemsCargados.push({ id: Date.now(), nombre: "", valor: "" });
                        }

                        const vidaUtilGlobal = sectionDataApi.vidaUtilAnos != null 
                            ? limpiarNumero(sectionDataApi.vidaUtilAnos) 
                            : "";
                            
                        const salvamentoGlobal = sectionDataApi.valorSalvamento != null 
                            ? limpiarNumero(sectionDataApi.valorSalvamento) 
                            : "";

                        newState[id] = {
                            vidaUtil: vidaUtilGlobal,
                            valorSalvamento: salvamentoGlobal,
                            items: itemsCargados
                        };
                    }
                });
                setSecciones(newState);

            } catch (activosFijosError) {
                if (activosFijosError.statusCode === 404) {
                    console.warn("No se encontraron datos. Mostrando formulario vacío.");
                    setDataExists(false);
                    setSecciones(getInitialState());
                } else {
                    setError(activosFijosError.message || "Error al cargar los datos.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivosFijos();
    }, [projectId]);

    const agregarActivo = (seccionId) => {
        const nuevoActivo = { id: Date.now(), nombre: "", valor: "" };
        setSecciones((prev) => ({
            ...prev,
            [seccionId]: {
                ...prev[seccionId],
                items: [...prev[seccionId].items, nuevoActivo]
            }
        }));
    };

    const eliminarActivo = (seccionId, activoId) => {
        if (window.confirm("¿Está seguro que desea eliminar el activo?")) {
            setSecciones((prev) => ({
                ...prev,
                [seccionId]: {
                    ...prev[seccionId],
                    items: prev[seccionId].items.filter((activo) => activo.id !== activoId)
                }
            }));
        }
    };

    const handleSectionChange = (seccionId, field, value) => {
        setSecciones((prev) => ({
            ...prev,
            [seccionId]: {
                ...prev[seccionId],
                [field]: limpiarNumero(value)
            }
        }));
    };

    const handleItemChange = (seccionId, activoId, field, value) => {
        setSecciones((prev) => ({
            ...prev,
            [seccionId]: {
                ...prev[seccionId],
                items: prev[seccionId].items.map((item) => {
                    if (item.id === activoId) {
                        const valorFinal = field === "valor" 
                            ? limpiarNumero(value) 
                            : extraerValor(value);
                        return { ...item, [field]: valorFinal };
                    }
                    return item;
                })
            }
        }));
    };

    const handleGoBack = async () => {
        await runWithLoader(async () => {});
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        let navTarget = null;

        await runWithLoader(async () => {
            const activosFijosPayload = {};
            
            SECCIONES.forEach(({ id, apiKey, campos }) => {
                const sectionData = secciones[id];
                const itemsLimpios = sectionData.items
                    .filter(item => item.nombre.trim() !== "")
                    .map(item => ({
                        nombre: item.nombre.trim(),
                        valor: parseFloat(item.valor) || 0,
                    }));
                
                if (itemsLimpios.length > 0) {
                    const sectionPayload = { items: itemsLimpios };
                    if (campos.includes("vidaUtil")) {
                        sectionPayload.vidaUtilAnos = parseInt(sectionData.vidaUtil, 10) || 0;
                    }
                    if (campos.includes("valorSalvamento")) {
                        sectionPayload.valorSalvamento = parseFloat(sectionData.valorSalvamento) || 0;
                    }
                    activosFijosPayload[apiKey] = sectionPayload;
                }
            });

            console.log("Data to send:", JSON.stringify(activosFijosPayload, null, 2));

            try {
                console.log("Enviando datos de Activos Fijos (Upsert)");
                await axiosClient.postActivosFijos(`/api/v1/activos-fijos/${projectId}`, activosFijosPayload);
                navTarget = { path: '/salarioAdmins', state: { projectId, openingYear } };
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
                    <img src={cabezoteActivos} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <p>Ingrese cada uno de los activos fijos necesarios al inicio del proyecto para conformar su infraestructura, determinando su clasificación en grupo y el valor.</p>
                    <p>Ingrese además la vida útil de los activos, y el Valor de Salvamento o Valor Residual (Una estimación de venta de dichos activos luego de la vida útil registrada).</p>
                    
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        {SECCIONES.map(({ id, nombre, campos }) => (
                            <div key={id} className="activos-container">
                                <h3 className="section-title">{nombre}</h3>

                                {/* Inputs Globales */}
                                {(campos.includes("vidaUtil") || campos.includes("valorSalvamento")) && (
                                    <div style={{ display: "flex", gap: "20px", marginTop: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
                                        
                                        {campos.includes("vidaUtil") && (
                                            <div style={{ flex: 1, minWidth: "200px" }}>
                                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>
                                                    Vida útil (años):
                                                </label>
                                                <CustomInput 
                                                    type="number" 
                                                    value={secciones[id].vidaUtil} 
                                                    placeholder={"Ej: 5"} 
                                                    onChange={(value) => handleSectionChange(id, "vidaUtil", value)} 
                                                />
                                            </div>
                                        )}

                                        {campos.includes("valorSalvamento") && (
                                            <div style={{ flex: 1, minWidth: "200px" }}>
                                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>
                                                    Valor de salvamento:
                                                </label>
                                                <CustomInput 
                                                    type="number" 
                                                    value={secciones[id].valorSalvamento} 
                                                    placeholder={"Ej: $0"} 
                                                    onChange={(value) => handleSectionChange(id, "valorSalvamento", value)} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tabla de Ítems */}
                                <div className="tabla-activos">
                                    <table className="tabla-estrategias">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th className="estrategia-celda-nombre">Nombre del activo</th>
                                                <th>Valor</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {secciones[id].items.map((activo, index) => (
                                                <tr key={activo.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="estrategia-celda-nombre">
                                                        <CustomInput 
                                                            value={activo.nombre} 
                                                            placeholder={"Nombre del activo"} 
                                                            onChange={(value) => handleItemChange(id, activo.id, "nombre", value)} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <CustomInput 
                                                            type="number"
                                                            value={activo.valor} 
                                                            placeholder={"$0"} 
                                                            onChange={(value) => handleItemChange(id, activo.id, "valor", value)} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <button type="button" className="estrategia-boton-eliminar" onClick={() => eliminarActivo(id, activo.id)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button" className="boton-agregar" onClick={() => agregarActivo(id)}>+ Agregar activo</button>
                            </div>
                        ))}
                    </form>
                    
                    {/* BOTÓN CON VALIDACIÓN */}
                    <div className="buttons-container">
                        <button type="button" className="nav-btn anterior" onClick={handleGoBack}>&lt; Anterior</button>
                        <button 
                            type="button" 
                            className="nav-btn siguiente" 
                            onClick={handleSubmit}
                            disabled={!formularioCompleto}
                            style={{
                                opacity: formularioCompleto ? 1 : 0.5,
                                cursor: formularioCompleto ? 'pointer' : 'not-allowed'
                            }}
                        >Guardar y continuar &gt;</button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ActivosFijos;