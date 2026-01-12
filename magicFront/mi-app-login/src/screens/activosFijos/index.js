import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
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
    return String(dato).split(/[.,]/)[0].replace(/\D/g, '');
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
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false);
    // const previousProjectId = useRef(null); // (Opcional según tu preferencia de recarga)
    const [secciones, setSecciones] = useState(getInitialState);

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
                    // Verificamos si existe la sección en la respuesta
                    if (data[apiKey]) {
                        const sectionDataApi = data[apiKey];
                        
                        // 1. Cargar Items
                        const itemsCargados = (sectionDataApi.items || []).map((item, index) => ({
                            id: `api-item-${id}-${index}`,
                            nombre: item.nombre || "",
                            valor: limpiarNumero(item.valor),
                        }));

                        // Si no hay items, dejamos uno vacío para que se vea el input
                        if (itemsCargados.length === 0) {
                            itemsCargados.push({ id: Date.now(), nombre: "", valor: "" });
                        }

                        // 2. Cargar Valores Globales (Vida Útil y Salvamento) desde la raíz de la sección
                        const vidaUtilGlobal = sectionDataApi.vidaUtilAnos 
                            ? limpiarNumero(sectionDataApi.vidaUtilAnos) 
                            : "";
                            
                        const salvamentoGlobal = sectionDataApi.valorSalvamento 
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

    // --- CORRECCIÓN PRINCIPAL AQUÍ (ENVÍO) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const activosFijosPayload = {};
        
        SECCIONES.forEach(({ id, apiKey, campos }) => {
            const sectionData = secciones[id];
            
            // 1. Preparamos el array de items (Solo nombre y valor)
            const itemsLimpios = sectionData.items
                .filter(item => item.nombre.trim() !== "")
                .map(item => ({
                    nombre: item.nombre.trim(),
                    valor: parseFloat(item.valor) || 0,
                }));
            
            // Solo enviamos la sección si tiene items válidos
            if (itemsLimpios.length > 0) {
                // Estructura base: { items: [...] }
                const sectionPayload = {
                    items: itemsLimpios
                };

                // 2. Agregamos las propiedades al nivel de la sección (HERMANAS de items)
                if (campos.includes("vidaUtil")) {
                    sectionPayload.vidaUtilAnos = parseInt(sectionData.vidaUtil, 10) || 0;
                }
                
                if (campos.includes("valorSalvamento")) {
                    sectionPayload.valorSalvamento = parseFloat(sectionData.valorSalvamento) || 0;
                }

                // Asignamos al objeto final
                activosFijosPayload[apiKey] = sectionPayload;
            }
        });

        console.log("Data to send:", JSON.stringify(activosFijosPayload, null, 2));

        try {
            if (dataExists) {
                 // await axiosClient.put(...) 
                 console.log("Datos actualizados (Simulación)");
            } else {
                await axiosClient.postActivosFijos(`/api/v1/activos-fijos/${projectId}`, activosFijosPayload);
                console.log("Datos creados (POST)");
            }
            navigate('/salarioAdmins', { state: { projectId, openingYear } });
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
                    <img src={cabezoteActivos} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <p>Ingrese cada uno de los activos fijos...</p>
                    
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
                                                    placeholder={"Ej: 100000"} 
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

export default ActivosFijos;