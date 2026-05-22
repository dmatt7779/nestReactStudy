import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
import analisisImg from "../../images/cabezote_analisis.png";
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png";
import tituloMercadeoImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png";
import tituloMarketingImg from "../../images/titulo_marketing_publicidad.png";
import axiosClient from "../../utils/axios";

const extraerValor = (input) => {
    if (input && typeof input === 'object' && input.target && typeof input.target.value !== 'undefined') {
        return input.target.value;
    }
    return input;
};

const limpiarNumero = (valor) => {
    const dato = extraerValor(valor);
    if (dato === null || dato === undefined) return "0";
    return String(dato).replace(/[^0-9.\-]/g, '') || "0";
};

const ProyeccionMacro = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [projectId, setProjectId] = useState(() => {
        return location.state?.projectId || sessionStorage.getItem('currentProjectId');
    })
    const [openingYear, setOpeningYear] = useState(new Date().getFullYear().toString())
    const [isLoading, setIsLoading] = useState(true)
    const { isProcessing, runWithLoader } = useProcessing()
    const [error, setError] = useState(null)
    const [proyeccionMacroData, setProyeccionMacroData] = useState(null)
    const previousProjectId = useRef(null)

    // Estado para controlar si el formulario es válido
    const [formularioCompleto, setFormularioCompleto] = useState(false);

    const calculateYears = useCallback((year) => {
        const startYear = parseInt(year, 10)
        return Array.from({ length: 5 }, (_, i) => startYear + i)
    }, [])

    const [years, setYears] = useState(() => calculateYears(openingYear))

    useEffect(() => {
        setYears(calculateYears(openingYear))
    }, [openingYear, calculateYears])

    const [values, setValues] = useState(() => {
        const categories = ["IPC", "Devaluation", "InterestRate", "PIB"]
        const initialValues = {}
        categories.forEach(category => {
            initialValues[category] = {}
            years.forEach(year => {
                initialValues[category][year] = ""
            })
        })
        return initialValues
    })

    const [tasaIVA, setTasaIVA] = useState("")

    const [productos, setProductos] = useState(() => [
        { id: Date.now(), nombre: "", cantidad: "", precioSinIVA: "", costoVariable: "" }
    ])

    const [opcionSeleccionadaUnidades, setOpcionSeleccionadaUnidades] = useState("")

    const [crecimientoUnidades, setCrecimientoUnidades] = useState(() => {
        const initialCrecimiento = {}
        years.forEach(year => {
            initialCrecimiento[year] = ""
        })
        return initialCrecimiento
    })

    const [opcionSeleccionadaPrecios, setOpcionSeleccionadaPrecios] = useState("")

    const [crecimientoPrecios, setCrecimientoPrecios] = useState(() => {
        const initialCrecimiento = {}
        years.forEach(year => {
            initialCrecimiento[year] = ""
        })
        return initialCrecimiento
    })

    const [opcionSeleccionadaCostos, setOpcionSeleccionadaCostos] = useState("")

    const [crecimientoCostos, setCrecimientoCostos] = useState(() => {
        const initialCrecimiento = {}
        years.forEach(year => {
            initialCrecimiento[year] = ""
        })
        return initialCrecimiento
    })

    const [estrategias, setEstrategias] = useState(() => {
        return [
            {
                id: Date.now(),
                nombre: "",
                valores: years.reduce((acc, year) => {
                    acc[year] = ""
                    return acc
                }, {}),
            },
        ]
    })

    // --- NUEVO: EFECTO DE VALIDACIÓN DEL FORMULARIO ---
    useEffect(() => {
        // 1. Validar Macro Variables (IPC, PIB, etc.)
        const macroValido = ["IPC", "Devaluation", "InterestRate", "PIB"].every(cat =>
            years.every(year => values[cat] && values[cat][year] !== "")
        );

        // 2. Validar Tasa IVA
        const ivaValido = tasaIVA !== "";

        // 3. Validar Productos (Al menos uno, y todos completos)
        const productosValidos = productos.length > 0 && productos.every(p => 
            p.nombre.trim() !== "" &&
            String(p.cantidad) !== "" &&
            String(p.precioSinIVA) !== "" &&
            String(p.costoVariable) !== ""
        );

        // 4. Validar Crecimientos (Helper function)
        const validarCrecimiento = (opcion, valores) => {
            if (!opcion) return false; // Debe seleccionar radio
            if (opcion !== "Estrategia") return true; // Si es PIB o IPC, es válido
            // Si es Estrategia, validamos años (saltando el primero si así lo requiere la lógica visual)
            // En tu UI el primer año está disabled, así que validamos slice(1)
            return years.slice(1).every(year => valores[year] !== "");
        };

        const unidadesValido = validarCrecimiento(opcionSeleccionadaUnidades, crecimientoUnidades);
        const preciosValido = validarCrecimiento(opcionSeleccionadaPrecios, crecimientoPrecios);
        const costosValido = validarCrecimiento(opcionSeleccionadaCostos, crecimientoCostos);

        // 5. Validar Estrategias de Marketing
        const estrategiasValidas = estrategias.every(e => 
            e.nombre.trim() !== "" &&
            years.every(year => e.valores[year] !== "")
        );

        setFormularioCompleto(
            macroValido && ivaValido && productosValidos &&
            unidadesValido && preciosValido && costosValido &&
            estrategiasValidas
        );

    }, [
        values, tasaIVA, productos, 
        opcionSeleccionadaUnidades, crecimientoUnidades,
        opcionSeleccionadaPrecios, crecimientoPrecios,
        opcionSeleccionadaCostos, crecimientoCostos,
        estrategias, years
    ]);

    useEffect(() => {
        const fetchProyeccionMacro = async () => {
            if (!projectId) {
                setIsLoading(false)
                return
            }

            if (projectId !== previousProjectId.current) {
                setIsLoading(true)
                setError(null)
                setProyeccionMacroData(null)
                previousProjectId.current = projectId

                try {
                    const projectInfoResponse = await axiosClient.get(`/api/v1/project-info/${projectId}`)
                    const openingYearFromApi = projectInfoResponse?.openingYear?.toString() || new Date().getFullYear().toString()

                    setOpeningYear(openingYearFromApi)
                    const newYears = calculateYears(openingYearFromApi)
                    setYears(newYears)

                    try {
                        const response = await axiosClient.get(`/api/v1/proyeccion-macro/${projectId}`)
                        setProyeccionMacroData(response)

                        if (response.proyeccionesMacroeconomicas) {
                            setValues(prevValues => {
                                const updatedValues = { ...prevValues }
                                const macroData = response.proyeccionesMacroeconomicas
                                newYears.forEach((year, index) => {
                                    updatedValues["IPC"][year] = macroData?.ipc?.[index]?.toString() || ""
                                    updatedValues["Devaluation"][year] = macroData?.devaluacion?.[index]?.toString() || ""
                                    updatedValues["InterestRate"][year] = macroData?.tasaInteres?.[index]?.toString() || ""
                                    updatedValues["PIB"][year] = macroData?.pib?.[index]?.toString() || ""
                                })
                                return updatedValues
                            })
                        }

                        setTasaIVA(response.analisisMercado?.tasaIva?.toString() || "")

                        if (response.producto && response.producto.length > 0) {
                            setProductos(response.producto.map((producto, index) => ({
                                id: `producto-${Date.now()}-${index}`,
                                nombre: producto.nombre || "",
                                cantidad: limpiarNumero(producto.cantidadFacturar),
                                precioSinIVA: limpiarNumero(producto.precioSinIva),
                                costoVariable: limpiarNumero(producto.costoVarProdAnoBase),
                            })));
                        } else {
                            setProductos([{ id: Date.now(), nombre: "", cantidad: "", precioSinIVA: "", costoVariable: "" }]);
                        }

                        if (response.analisisMercado?.crecimientoUnidades) {
                            if (response.analisisMercado.crecimientoUnidades.pib === true) {
                                setOpcionSeleccionadaUnidades("PIB");
                            } else if (response.analisisMercado.crecimientoUnidades.estrategia === true) {
                                setOpcionSeleccionadaUnidades("Estrategia");
                            } else if (response.analisisMercado.crecimientoUnidades.ipc === true) {
                                setOpcionSeleccionadaUnidades("IPC");
                            }
                            
                            if (response.analisisMercado.crecimientoUnidades.crecimientoCantidades) {
                                const apiCantidades = response.analisisMercado.crecimientoUnidades.crecimientoCantidades;
                                const newState = newYears.reduce((acc, year, index) => {
                                    if (index === 0) {
                                        acc[year] = ""; 
                                    } else {
                                        acc[year] = apiCantidades[index]?.toString() || "";
                                    }
                                    return acc;
                                }, {});
                                setCrecimientoUnidades(newState);
                            }
                        }

                        if (response.analisisMercado?.crecimientoPrecios) {
                            if (response.analisisMercado.crecimientoPrecios.pib === true) {
                                setOpcionSeleccionadaPrecios("PIB");
                            } else if (response.analisisMercado.crecimientoPrecios.estrategia === true) {
                                setOpcionSeleccionadaPrecios("Estrategia");
                            } else if (response.analisisMercado.crecimientoPrecios.ipc === true) {
                                setOpcionSeleccionadaPrecios("IPC");
                            }

                            if (response.analisisMercado.crecimientoPrecios.crecimientoCantidades) {
                                const apiCantidades = response.analisisMercado.crecimientoPrecios.crecimientoCantidades;
                                const newState = newYears.reduce((acc, year, index) => {
                                    if (index === 0) {
                                        acc[year] = "";
                                    } else {
                                        acc[year] = apiCantidades[index]?.toString() || "";
                                    }
                                    return acc;
                                }, {});
                                setCrecimientoPrecios(newState);
                            }
                        }

                        if (response.analisisMercado?.crecimientoCostos) {
                            if (response.analisisMercado.crecimientoCostos.pib === true) {
                                setOpcionSeleccionadaCostos("PIB");
                            } else if (response.analisisMercado.crecimientoCostos.estrategia === true) {
                                setOpcionSeleccionadaCostos("Estrategia");
                            } else if (response.analisisMercado.crecimientoCostos.ipc === true) {
                                setOpcionSeleccionadaCostos("IPC");
                            }

                            if (response.analisisMercado.crecimientoCostos.crecimientoCantidades) {
                                const apiCantidades = response.analisisMercado.crecimientoCostos.crecimientoCantidades;
                                const newState = newYears.reduce((acc, year, index) => {
                                    if (index === 0) {
                                        acc[year] = "";
                                    } else {
                                        acc[year] = apiCantidades[index]?.toString() || "";
                                    }
                                    return acc;
                                }, {});
                                setCrecimientoCostos(newState);
                            }
                        }

                        if (response.estrategiaMarketing && response.estrategiaMarketing.length > 0) {
                            setEstrategias(response.estrategiaMarketing.map((estrategia, index) => ({
                                id: `estrategia-${Date.now()}-${index}`,
                                nombre: estrategia.nombre,
                                valores: newYears.reduce((acc, year, yearIndex) => {
                                    acc[year] = limpiarNumero(estrategia.valores[yearIndex]);
                                    return acc;
                                }, {})
                            })));
                        } else {
                            setEstrategias([{ id: Date.now(), nombre: "", valores: newYears.reduce((acc, year) => ({ ...acc, [year]: "" }), {}) }]);
                        }

                    } catch (proyeccionMacroError) {
                        if (proyeccionMacroError.statusCode === 404) {
                            console.warn("No se encontraron datos de ProyeccionMacro. Mostrando formulario vacío.")
                        } else {
                            setError(proyeccionMacroError.message || "Error al obtener la proyeccion macro.")
                        }
                    }
                } catch (projectInfoError) {
                    setError(projectInfoError.message || "Error al obtener información del proyecto.")
                    navigate(-1)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }

        fetchProyeccionMacro()
    }, [projectId, navigate, calculateYears])

    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem('currentProjectId', projectId)
        }
    }, [projectId])

    const handleChange = (category, year, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [category]: {
                ...prevValues[category],
                [year]: value,
            },
        }))
    }

    const agregarProducto = () => {
        if (productos.length < 10) {
            setProductos((productosAnteriores) => [
                ...productosAnteriores,
                { id: Date.now(), nombre: "", cantidad: "", precioSinIVA: "", costoVariable: "" }
            ])
        }
    }

    const eliminarProducto = (id) => {
        const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar este producto?")
        if (confirmarEliminar) {
            setProductos((productosAnteriores) => productosAnteriores.filter(producto => producto.id !== id))
        }
    }

    const manejarCambioProducto = (id, campo, value) => {
        setProductos((productosAnteriores) => {
            return productosAnteriores.map((producto) => {
                if (producto.id === id) {
                    const valorFinal = extraerValor(value);
                    return { ...producto, [campo]: valorFinal };
                }
                return producto;
            })
        })
    }

    const manejarCambioUnidades = (e) => {
        setOpcionSeleccionadaUnidades(e.target.value)
    }

    const manejarCambioCrecUnidades = (anio, value) => {
        setCrecimientoUnidades((prev) => ({ ...prev, [anio]: value }))
    }

    const manejarCambioPrecios = (e) => {
        setOpcionSeleccionadaPrecios(e.target.value)
    }

    const manejarCambioCrecPrecios = (anio, value) => {
        setCrecimientoPrecios((prev) => ({ ...prev, [anio]: value }))
    }

    const manejarCambioCostos = (e) => {
        setOpcionSeleccionadaCostos(e.target.value)
    }

    const manejarCambioCrecCostos = (anio, value) => {
        setCrecimientoCostos((prev) => ({ ...prev, [anio]: value }))
    }

    const agregarEstrategia = () => {
        if (estrategias.length < 5) {
            setEstrategias((estrategiasAnteriores) => [
                ...estrategiasAnteriores,
                {
                    id: Date.now(),
                    nombre: "",
                    valores: years.reduce((acc, year) => {
                        acc[year] = ""
                        return acc
                    }, {}),
                },
            ])
        }
    }

    const eliminarEstrategia = (id) => {
        const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar esta estrategia?")
        if (confirmarEliminar) {
            setEstrategias((estrategiasAnteriores) =>
                estrategiasAnteriores.filter((estrategia) => estrategia.id !== id)
            )
        }
    }

    const manejarCambioEstrategia = (id, campo, value) => {
        setEstrategias((estrategiasAnteriores) =>
            estrategiasAnteriores.map((estrategia) => {
                if (estrategia.id !== id) {
                    return estrategia
                }
                
                if (campo === "nombre") {
                    return { ...estrategia, nombre: extraerValor(value) }
                } else {
                    return {
                        ...estrategia,
                        valores: {
                            ...estrategia.valores,
                            [campo]: limpiarNumero(value),
                        },
                    }
                }
            })
        )
    }

    const handleGoBack = async () => {
        await runWithLoader(async () => {})
        navigate(-1)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        let navTarget = null

        await runWithLoader(async () => {
            try {
                if (!projectId) {
                    setError("projectId es requerido para guardar los datos.")
                    return
                }

                const isPibUnidades = opcionSeleccionadaUnidades === "PIB"
                const isEstrategiaUnidades = opcionSeleccionadaUnidades === "Estrategia"
                const isIpcUnidades = opcionSeleccionadaUnidades === "IPC"

                const isPibPrecios = opcionSeleccionadaPrecios === "PIB"
                const isEstrategiaPrecios = opcionSeleccionadaPrecios === "Estrategia"
                const isIpcPrecios = opcionSeleccionadaPrecios === "IPC"

                const isPibCostos = opcionSeleccionadaCostos === "PIB"
                const isEstrategiaCostos = opcionSeleccionadaCostos === "Estrategia"
                const isIpcCostos = opcionSeleccionadaCostos === "IPC"

                const dataToSend = {
                    proyeccionesMacroeconomicas: {
                        ipc: years.map(year => parseFloat(values.IPC[year]) || 0),
                        devaluacion: years.map(year => parseFloat(values.Devaluation[year]) || 0),
                        tasaInteres: years.map(year => parseFloat(values.InterestRate[year]) || 0),
                        pib: years.map(year => parseFloat(values.PIB[year]) || 0),
                    },
                    analisisMercado: {
                        tasaIva: parseFloat(tasaIVA) || 0,
                        productos: productos.map(producto => ({
                            nombre: producto.nombre,
                            cantidadFacturar: parseInt(producto.cantidad) || 0,
                            precioSinIva: parseFloat(producto.precioSinIVA) || 0,
                            costoVarProdAnoBase: parseFloat(producto.costoVariable) || 0,
                        })),
                        crecimientoUnidades: {
                            pib: isPibUnidades,
                            estrategia: isEstrategiaUnidades,
                            ipc: isIpcUnidades,
                            crecimientoCantidades: isEstrategiaUnidades
                                ? years.map(year => parseFloat(crecimientoUnidades[year]) || 0)
                                : []
                        },
                        crecimientoPrecios: {
                            pib: isPibPrecios,
                            estrategia: isEstrategiaPrecios,
                            ipc: isIpcPrecios,
                            crecimientoCantidades: isEstrategiaPrecios
                                ? years.map(year => parseFloat(crecimientoPrecios[year]) || 0)
                                : []
                        },
                        crecimientoCostos: {
                            ipc: isIpcCostos,
                            estrategia: isEstrategiaCostos,
                            pib: isPibCostos,
                            crecimientoCantidades: isEstrategiaCostos
                                ? years.map(year => parseFloat(crecimientoCostos[year]) || 0)
                                : []
                        },
                        estrategiaMarketing: estrategias.map(estrategia => ({
                            nombre: estrategia.nombre,
                            valores: years.map(year => parseFloat(estrategia.valores[year]) || 0)
                        })),
                    }
                }
                console.log("proyeccionMacro - Data to send: ", JSON.stringify(dataToSend, null, 2))
                console.log("proyeccionMacro - Data to send: ", JSON.stringify(dataToSend, null, 2))
                try {
                    console.log(`proyeccionMacro - Enviando datos (Crear o Actualizar) para el proyecto: ${projectId}`)
                    const response = await axiosClient.postProyeccionMacro(`/api/v1/proyeccion-macro/${projectId}`, dataToSend)
                    if (response) {
                        navTarget = { path: '/costosGastos', state: { projectId, openingYear } }
                    }
                } catch (error) {
                    console.error("Error al guardar la proyeccion macro:", error)
                    setError(error.message || "Error al guardar la proyeccion macro.")
                }
            } catch (error) {
                console.error("Error al preparar o enviar datos:", error)
                setError(error.message || "Error al preparar la proyeccion macro.")
            }
        })
        if (navTarget) navigate(navTarget.path, { state: navTarget.state })
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }

    return (
        <div className="project-info-container">
            {isProcessing && <CeipaLoader />}
            <Navbar />
            <div className="white-container-n">
                <div className="robot-container-an">
                    <img src={analisisImg} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    <div className="section">
                        <img src={tituloAnalisiImg} alt="Análisis del entorno" className="section-img1" />
                    </div>
                    <p>
                        En el análisis del entorno, es necesario Investigar y contemplar las proyecciones de ciertas variables Macroeconómicas. En este aspecto, existen entidades que se encargan de realizar estos estudios, y los publican en sus portales digitales.</p>

                    <form>
                        <div className="table-container">
                            <table className="macro-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {years.map((year) => (
                                            <th key={year}>Año {year}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { key: "IPC", label: "IPC" },
                                        { key: "Devaluation", label: "Re / Devaluación" },
                                        { key: "InterestRate", label: "Tasa de Interés Efectiva Anual" },
                                        { key: "PIB", label: "PIB" },
                                    ].map(({ key, label }) => (
                                        <tr key={key}>
                                            <td>{label}</td>
                                            {years.map((year) => (
                                                <td key={year}>
                                                    <CustomInput
                                                        id={`input-${key}-${year}`}
                                                        type="percentage"
                                                        value={values[key]?.[year] || ""}
                                                        onChange={(value) => handleChange(key, year, value)}
                                                        placeholder={"0%"}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="table-footer">
                                Fuente: Proyecciones Macroeconómicas Bancolombia, Davivienda, BBVA, entre otros.
                            </div>
                        </div>

                        <div className="section">
                            <img src={tituloMercadeoImg} alt="Análisis del entorno" className="section-img5" />
                        </div>
                        <p>
                            En el plan de mercadeo y ventas, se debe realizar una estimación de las cantidades a facturar y los precios promedio de ventas para el primer año por cada producto y/o servicio, así como también los factores de crecimiento (con base en indicador o estrategia) y el costo de cada una de las estrategias de Marketing para atraer clientes.
                        </p>
                        <div className="analisis-info-container">
                            <div className="tasa-iva">
                                <p>Para cada producto o linea de negocios establecida, determine las cantidades y precios del año uno (1er año).</p>
                                <label htmlFor="input-tasa-iva">Tasa IVA:</label>
                                <CustomInput
                                    id="input-tasa-iva"
                                    type="percentage"
                                    value={tasaIVA}
                                    onChange={setTasaIVA}
                                    placeholder={"0%"}
                                />
                            </div>

                            <div className="proyeccion-container">
                                <table className="tabla-productos">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th className="producto-celda-nombre">Nombre del Producto</th>
                                            <th>Cantidad año {years[0]}</th>
                                            <th>Precio sin IVA año {years[0]}</th>
                                            <th>
                                                <span title="Determine el costo variable promedio...">
                                                    Costo Variable por Unidad Año {years[0]} ℹ️
                                                </span>
                                            </th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {productos.map((producto, index) => (
                                            <tr key={producto.id}>
                                                <td>{index + 1}</td>

                                                <td className="producto-celda-nombre">
                                                    <CustomInput
                                                        id={`producto-nombre-${producto.id}`}
                                                        value={producto.nombre}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "nombre", value)}
                                                        placeholder="nombre"
                                                        type="text"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-cantidad-${producto.id}`}
                                                        value={producto.cantidad}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "cantidad", value)}
                                                        placeholder="0"
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-precioSinIVA-${producto.id}`}
                                                        value={producto.precioSinIVA}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "precioSinIVA", value)}
                                                        placeholder="$0"
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-costoVariable-${producto.id}`}
                                                        value={producto.costoVariable}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "costoVariable", value)}
                                                        placeholder="$0"
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <button className="producto-boton-eliminar" onClick={() => eliminarProducto(producto.id)}>
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {productos.length < 10 && (
                                    <button type="button" className="boton-agregar" onClick={agregarProducto}>
                                        + Agregar Producto
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3>Crecimiento en Unidades</h3>
                        <p>El crecimiento en UNIDADES depende de (marque en el recuadro con una X):</p>
                        <div id="crecimiento-unidades" className="contenedor-crecimiento">
                            <CustomInput
                                id="opciones-crecimiento-unidades"
                                label=""
                                type="radio"
                                value={opcionSeleccionadaUnidades}
                                onChange={manejarCambioUnidades}
                                options={["PIB", "Estrategia", "IPC"]}
                                name="metodoCrecimientoUnidades"
                            />
                        </div>

                        {opcionSeleccionadaUnidades === "Estrategia" && (
                            <div id="crecimiento-unidades-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo...
                                </p>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput
                                                id={`crecimiento-unidades-${anio}`}
                                                type="percentage"
                                                value={crecimientoUnidades[anio]}
                                                onChange={(value) => manejarCambioCrecUnidades(anio, value)}
                                                placeholder={"0%"}
                                                disabled={anio === years[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3>Crecimiento en Precios</h3>
                        <p>El crecimiento en PRECIOS depende de (marque en el recuadro con una X):</p>
                        <div id="crecimiento-precios" className="contenedor-crecimiento">
                            <CustomInput
                                id="opciones-crecimiento-precios"
                                label=""
                                type="radio"
                                value={opcionSeleccionadaPrecios}
                                onChange={manejarCambioPrecios}
                                placeholder={"0%"}
                                options={["PIB", "Estrategia", "IPC"]}
                                name="metodoCrecimientoPrecios"
                            />
                        </div>

                        {opcionSeleccionadaPrecios === "Estrategia" && (
                            <div id="crecimiento-precios-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo...
                                </p>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput
                                                id={`crecimiento-unidades-${anio}`}
                                                type="percentage"
                                                value={crecimientoPrecios[anio]}
                                                onChange={(value) => manejarCambioCrecPrecios(anio, value)}
                                                placeholder={"0%"}
                                                disabled={anio === years[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3>Crecimiento en Costos</h3>
                        <p>El crecimiento en COSTOS variables por unidad depende de (marque en el recuadro con una X):</p>
                        <div id="crecimiento-costos" className="contenedor-crecimiento">
                            <CustomInput
                                id="opciones-crecimiento-costos"
                                label=""
                                type="radio"
                                value={opcionSeleccionadaCostos}
                                onChange={manejarCambioCostos}
                                placeholder={"0%"}
                                options={["PIB", "Estrategia", "IPC"]}
                                name="metodoCrecimientoCostos"
                            />
                        </div>

                        {opcionSeleccionadaCostos === "Estrategia" && (
                            <div id="crecimiento-costos-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo, indique los crecimientos porcentuales de precios de venta para cada año.
                                </p>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput
                                                id={`crecimiento-costos-${anio}`}
                                                type="percentage"
                                                value={crecimientoCostos[anio]}
                                                onChange={(value) => manejarCambioCrecCostos(anio, value)}
                                                placeholder={"0%"}
                                                disabled={anio === years[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="section">
                            <img src={tituloMarketingImg} alt="Marteting" className="section-img6" />
                        </div>
                        <div className="marketing-invest-container">
                            <p>Nombre las estrategias de mercadeo a realizar en su proyecto y el gasto estimado para cada año, a fin de darse a conocer y atraer clientes en el mercado competitivo.</p>
                            <div className="proyeccion-container">
                                <table className="tabla-estrategias">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th className="estrategia-celda-nombre">Nombre estrategia</th>
                                            {years.map((anio) => (
                                                <th key={`th-${anio}`}>Año {anio}</th>
                                            ))}
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {estrategias.map((estrategia, index) => (
                                            <tr key={estrategia.id}>
                                                <td>{index + 1}</td>

                                                <td className="estrategia-celda-nombre">
                                                    <CustomInput
                                                        id={`estrategia-nombre-${estrategia.id}`}
                                                        value={estrategia.nombre}
                                                        onChange={(value) => manejarCambioEstrategia(estrategia.id, "nombre", value)}
                                                        placeholder="nombre"
                                                        type="text"
                                                    />
                                                </td>

                                                {years.map((anio) => (
                                                    <td key={`td-anio${anio}-${estrategia.id}`}>
                                                        <CustomInput
                                                            id={`estrategia-anio${anio}-${estrategia.id}`}
                                                            value={estrategia.valores?.[anio] || ""}
                                                            onChange={(value) => manejarCambioEstrategia(estrategia.id, anio, value)}
                                                            placeholder="$0"
                                                            type="number"
                                                        />
                                                    </td>
                                                ))}

                                                <td>
                                                    <button
                                                        className="estrategia-boton-eliminar"
                                                        onClick={() => eliminarEstrategia(estrategia.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {estrategias.length < 5 && (
                                    <button type="button" className="estrategia-boton-agregar" onClick={agregarEstrategia}>
                                        + Agregar Estrategia
                                    </button>
                                )}
                            </div>
                        </div>

                    </form>

                    {/* Botones de Navegación ACTUALIZADOS */}
                    <div className="buttons-container">
                        <button className="nav-btn anterior" onClick={handleGoBack}>&lt; Anterior</button>
                        <button 
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
    )
}

export default ProyeccionMacro