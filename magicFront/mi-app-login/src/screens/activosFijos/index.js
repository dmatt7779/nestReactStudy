import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteActivos from "../../images/cabezote_activos_fijos.png";
import axiosClient from "../../utils/axios";

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
  SECCIONES.map(({ id }) => [id, [{ id: Date.now(), nombre: "", valor: "", vidaUtil: "", valorSalvamento: "" }]])
);

const ActivosFijos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [projectId, setProjectId] = useState(() => {return location.state?.projectId || sessionStorage.getItem('currentProjectId')});
    const [openingYear, setOpeningYear] = useState(() => location.state?.openingYear || new Date().getFullYear().toString());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataExists, setDataExists] = useState(false);
    const previousProjectId = useRef(null);
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

            // Evita recargar si el projectId no ha cambiado
            if (projectId === previousProjectId.current) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            previousProjectId.current = projectId;

            try {
                const response = await axiosClient.get(`/api/v1/activos-fijos/${projectId}`);
                const data = response.activosFijos;
                setDataExists(true);
                const newState = getInitialState();
                SECCIONES.forEach(({ id, apiKey }) => {
                    if (data[apiKey] && data[apiKey].items && data[apiKey].items.length > 0) {
                        newState[id] = data[apiKey].items.map((item, index) => ({
                            id: `api-item-${id}-${index}`,
                            nombre: item.nombre || "",
                            valor: item.valor?.toString() || "",
                            vidaUtil: item.vidaUtilAnos?.toString() || "",
                            valorSalvamento: item.valorSalvamento?.toString() || "",
                        }));
                    }
                });
                setSecciones(newState);

            } catch (activosFijosError) {
                if (activosFijosError.statusCode === 404) {
                    console.warn("No se encontraron datos de Activos Fijos. Mostrando formulario vacío.");
                    setDataExists(false);
                    setSecciones(getInitialState());
                } else {
                    setError(activosFijosError.message || "Error al cargar los datos de activos fijos.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivosFijos();
    }, [projectId]);

    const agregarActivo = (seccionId) => {
        const nuevoActivo = { id: Date.now(), nombre: "", valor: "", vidaUtil: "", valorSalvamento: "" };
        setSecciones((prev) => ({ ...prev, [seccionId]: [...prev[seccionId], nuevoActivo] }));
    };

    const eliminarActivo = (seccionId, activoId) => {
        if (window.confirm("¿Está seguro que desea eliminar el activo?")) {
            setSecciones((prev) => ({
                ...prev,
                [seccionId]: prev[seccionId].filter((activo) => activo.id !== activoId),
            }));
        }
    };

    const handleChange = (seccionId, activoId, field, value) => {
        setSecciones((prev) => ({
            ...prev,
            [seccionId]: prev[seccionId].map((item) =>
                item.id === activoId ? { ...item, [field]: value } : item
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const activosFijosPayload = {};
        SECCIONES.forEach(({ id, apiKey, campos }) => {
            const items = secciones[id]
                .filter(item => item.nombre.trim() !== "")
                .map(item => {
                    const apiItem = {
                        nombre: item.nombre.trim(),
                        valor: parseFloat(item.valor) || 0,
                    };
                    if (campos.includes("vidaUtil")) {
                        apiItem.vidaUtilAnos = parseInt(item.vidaUtil, 10) || 0;
                    }
                    if (campos.includes("valorSalvamento")) {
                        apiItem.valorSalvamento = parseFloat(item.valorSalvamento) || 0;
                    }
                    return apiItem;
                });
            
            if (items.length > 0) {
                activosFijosPayload[apiKey] = { items };
            }
        });

        console.log("Data to send:", JSON.stringify(activosFijosPayload, null, 2));

        try {
            if (dataExists) {
                // await axiosClient.put(`/api/v1/activos-fijos/${projectId}`, dataToSend);
                console.log("Datos de Activos Fijos actualizados.");
            } else {
                await axiosClient.postActivosFijos(`/api/v1/activos-fijos/${projectId}`, activosFijosPayload);
                console.log("Datos de Activos Fijos creados.");
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
                    <form onSubmit={handleSubmit}>
                        {SECCIONES.map(({ id, nombre, campos }) => (
                            <div key={id} className="activos-container">
                                <h3 className="section-title">{nombre}</h3>
                                <div className="tabla-activos">
                                    <table className="tabla-estrategias">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th className="estrategia-celda-nombre">Nombre del activo</th>
                                                <th>Valor</th>
                                                {campos.includes("vidaUtil") && <th>Vida útil (años)</th>}
                                                {campos.includes("valorSalvamento") && <th>Valor de salvamento</th>}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {secciones[id].map((activo, index) => (
                                                <tr key={activo.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="estrategia-celda-nombre">
                                                        <CustomInput value={activo.nombre} onChange={(value) => handleChange(id, activo.id, "nombre", value)} />
                                                    </td>
                                                    <td>
                                                        <CustomInput type="number" value={activo.valor} onChange={(value) => handleChange(id, activo.id, "valor", value)} />
                                                    </td>
                                                    {campos.includes("vidaUtil") && (
                                                        <td><CustomInput type="number" value={activo.vidaUtil} onChange={(value) => handleChange(id, activo.id, "vidaUtil", value)} /></td>
                                                    )}
                                                    {campos.includes("valorSalvamento") && (
                                                        <td><CustomInput type="number" value={activo.valorSalvamento} onChange={(value) => handleChange(id, activo.id, "valorSalvamento", value)} /></td>
                                                    )}
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