import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../style/styles.css"
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import CustomInput from "../../components/CustomInput"
import analisisImg from "../../images/cabezote_analisis.png"
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png"
import tituloMercadeoImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png"
import axiosClient from "../../utils/axios"

const ProyeccionMacro = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [projectId, setProjectId] = useState(location.state?.projectId || null) 
    const [openingYear, setOpeningYear] = useState(new Date().getFullYear().toString())
    const [_loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [proyeccionMacroData, setProyeccionMacroData] = useState(null)
    const previousProjectId = useRef(null) 

    
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
        { id: Date.now(), nombre: "", cantidad: "0", precioSinIVA: "0", precioVenta: "0", costoVariable: "0" } 
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

    useEffect(() => {
        const fetchProyeccionMacro = async () => {
            
            if (!projectId) {
                 setLoading(false) 
                 return
            }

            
            
            if (previousProjectId.current === projectId && proyeccionMacroData !== null) {
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)
            setProyeccionMacroData(null) 

            try {
                
                const projectInfoResponse = await axiosClient.get(`/api/v1/project-info/${projectId}`)
                const openingYearFromApi = projectInfoResponse?.openingYear?.toString()

                
                if (openingYearFromApi !== openingYear) {
                    setOpeningYear(openingYearFromApi || new Date().getFullYear().toString())
                }

                
                const newYears = calculateYears(openingYearFromApi || new Date().getFullYear().toString())
                 
                if (JSON.stringify(newYears) !== JSON.stringify(years)) {
                    setYears(newYears)
                }


                
                try {
                    const response = await axiosClient.get(`/api/v1/proyeccion-macro/${projectId}`)
                    setProyeccionMacroData(response) 
                    previousProjectId.current = projectId 

                    if (response) {
                        

                        
                        if (response.proyeccionesMacroeconomicas) {
                            setValues(prevValues => {
                                const updatedValues = { ...prevValues }
                                const macroData = response.proyeccionesMacroeconomicas

                                years.forEach((year, index) => {
                                    updatedValues["IPC"][year] = macroData?.ipc?.[index]?.toString() || ""
                                    updatedValues["Devaluation"][year] = macroData?.devaluacion?.[index]?.toString() || ""
                                    updatedValues["InterestRate"][year] = macroData?.tasaInteres?.[index]?.toString() || ""
                                    updatedValues["PIB"][year] = macroData?.pib?.[index]?.toString() || ""
                                })
                                return updatedValues
                            })
                        }


                        
                        setTasaIVA(response.analisisMercado?.tasaIva?.toString() || "")

                        if (response.analisisMercado?.productos && response.analisisMercado.productos.length > 0) {
                            
                            setProductos(response.analisisMercado.productos.map(producto => ({
                                id: producto.id || Date.now(), 
                                nombre: producto.nombre || "",
                                cantidad: producto.cantidadFacturar?.toString() || "0",
                                precioSinIVA: producto.precioSinIva?.toString() || "0",
                                precioVenta: producto.precioVenta?.toString() || "0",
                                costoVariable: producto.costoVarProdAnoBase?.toString() || "0",
                            })))
                        } else {
                            
                            
                            
                        }

                        
                        if (response.analisisMercado?.crecimientoUnidades?.crecimientoCantidades) {
                            setCrecimientoUnidades(years.reduce((acc, year, index) => {
                                acc[year] = response.analisisMercado.crecimientoUnidades.crecimientoCantidades[index]?.toString() || ""
                                return acc
                            }, {}))
                        }

                        
                         if (response.analisisMercado?.crecimientoPrecios?.crecimientoCantidades) {
                             setCrecimientoPrecios(years.reduce((acc, year, index) => {
                                 acc[year] = response.analisisMercado.crecimientoPrecios.crecimientoCantidades[index]?.toString() || ""
                                 return acc
                             }, {}))
                         }

                        
                         if (response.analisisMercado?.crecimientoCostos?.crecimientoCantidades) {
                             setCrecimientoCostos(years.reduce((acc, year, index) => {
                                 acc[year] = response.analisisMercado.crecimientoCostos.crecimientoCantidades[index]?.toString() || ""
                                 return acc
                             }, {}))
                         }

                        
                         if (response.analisisMercado?.marketingInvestAnoBase) {
                             const backendMarketingData = response.analisisMercado.marketingInvestAnoBase
                             const frontendMarketingKeys = ["precio", "producto", "comunicacionales", "distribucion", "comunityManager"] 

                             setEstrategias(prevEstrategias => {
                                 return prevEstrategias.map((estrategia, index) => {
                                     const backendKey = frontendMarketingKeys[index] 
                                     const backendValues = backendMarketingData?.[backendKey]

                                     return {
                                         ...estrategia,
                                         
                                         nombre: estrategia.nombre || backendKey || `Estrategia ${index + 1}`,
                                         valores: years.reduce((acc, year, yearIndex) => {
                                             acc[year] = backendValues?.[yearIndex]?.toString() || ""
                                             return acc
                                         }, {}),
                                     }
                                 })
                             })
                         }

                    }
                } catch (proyeccionMacroError) {
                    if (proyeccionMacroError.statusCode === 404) {
                        console.warn("No se encontraron datos de ProyeccionMacro para este proyecto. Mostrando formulario vacío.")
                        setProyeccionMacroData(null) 
                    } else {
                        setError(proyeccionMacroError.message || "Error al obtener la proyeccion macro.")
                    }
                }
            } catch (projectInfoError) {
                setError(projectInfoError.message || "Error al obtener información del proyecto.")
                navigate(-1) 
            }
            finally {
                setLoading(false)
            }
        }

        fetchProyeccionMacro()
    }, [projectId, navigate, calculateYears, years]) 

    
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
                { id: Date.now(), nombre: "", cantidad: "0", precioSinIVA: "0", precioVenta: "0", costoVariable: "0" } 
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
            return productosAnteriores.map((producto) =>
                producto.id === id ? { ...producto, [campo]: value } : producto
            )
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
            estrategiasAnteriores.map((estrategia) =>
                estrategia.id === id
                    ? {
                        ...estrategia,
                        valores: {
                            ...estrategia.valores,
                            [campo]: value, 
                        },
                    }
                    : estrategia
            )
        )
    }


    
    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError(null)

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
                        precioVenta: parseFloat(producto.precioVenta) || 0,
                        costoVarProdAnoBase: parseFloat(producto.costoVariable) || 0,
                    })),
                    crecimientoUnidades: {
                        pib: isPibUnidades,
                        estrategia: isEstrategiaUnidades,
                        ipc: isIpcUnidades,
                        // Solo enviar crecimientoCantidades con valores si estrategia es true
                        crecimientoCantidades: isEstrategiaUnidades 
                            ? years.map(year => parseFloat(crecimientoUnidades[year]) || 0)
                            : []
                    },
                    crecimientoPrecios: {
                        pib: isPibPrecios,
                        estrategia: isEstrategiaPrecios,
                        ipc: isIpcPrecios,
                        // Solo enviar crecimientoCantidades con valores si estrategia es true
                        crecimientoCantidades: isEstrategiaPrecios
                            ? years.map(year => parseFloat(crecimientoPrecios[year]) || 0)
                            : []
                    },
                    crecimientoCostos: {
                        ipc: isIpcCostos,
                        estrategia: isEstrategiaCostos,
                        pib: isPibCostos,
                        // Solo enviar crecimientoCantidades con valores si estrategia es true
                        crecimientoCantidades: isEstrategiaCostos
                            ? years.map(year => parseFloat(crecimientoCostos[year]) || 0)
                            : []
                    },
                    marketingInvestAnoBase: {
                        precio: years.map(year => (estrategias[0]?.valores?.[year] ? parseFloat(estrategias[0].valores[year]) : 0)),
                        producto: years.map(year => (estrategias[1]?.valores?.[year] ? parseFloat(estrategias[1].valores[year]) : 0)),
                        comunicacionales: years.map(year => (estrategias[2]?.valores?.[year] ? parseFloat(estrategias[2].valores[year]) : 0)),
                        distribucion: years.map(year => (estrategias[3]?.valores?.[year] ? parseFloat(estrategias[3].valores[year]) : 0)),
                        comunityManager: years.map(year => (estrategias[4]?.valores?.[year] ? parseFloat(estrategias[4].valores[year]) : 0)),
                    }
                }
            }
            console.log(JSON.stringify(dataToSend, null, 2))
            try {
                const response = await axiosClient.postProyeccionMacro(`/api/v1/proyeccion-macro/${projectId}`, dataToSend)
                if (response) {
                    navigate("/costosGastos")
                }
            } catch (axiosError) {
                console.error("Error al guardar la proyeccion macro:", axiosError)
                setError(axiosError.message || "Error al guardar la proyeccion macro.")
            }
        } catch (error) {
            console.error("Error al guardar la proyeccion macro:", error)
            setError(error.message || "Error al guardar la proyeccion macro.")
        } finally {
            setLoading(false)
        }
    }

    
    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }

    return (
        <div className="project-info-container">
            <Navbar />
            <div className="white-container-n">
                <div className="robot-container-an">
                    <img src={analisisImg} alt="Robot" className="robot-img-an" />
                </div>
                <div className="contenido-container">
                    {/* Sección de Análisis del Entorno */}
                    <div className="section">
                        <img src={tituloAnalisiImg} alt="Análisis del entorno" className="section-img1" />
                    </div>
                    <p>
                        En el análisis del entorno, es necesario investigar y contemplar las proyecciones de
                        ciertas variables macroeconómicas. En este aspecto, existen entidades que se encargan
                        de realizar estos estudios y los publican en sus portales digitales.
                    </p>

                    <form>
                        {/* Tabla con inputs Análisis del entorno - proyecciones_macroeconomicas*/}
                        <div className="table-container">
                            <table className="macro-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {/* Renderizamos dinámicamente los años como encabezados */}
                                        {years.map((year) => (
                                            <th key={year}>Año {year}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Iteramos sobre las categorías de análisis - proyecciones_macroeconomicas*/}
                                    {[
                                        { key: "IPC", label: "IPC" },
                                        { key: "Devaluation", label: "Re / Devaluación" },
                                        { key: "InterestRate", label: "Tasa de Interés Efectiva Anual" },
                                        { key: "PIB", label: "PIB" },
                                    ].map(({ key, label }) => (
                                        <tr key={key}>
                                            {/* Primera celda con el nombre de la categoría */}
                                            <td>{label}</td>

                                            {/* Generamos los inputs dinámicamente para cada año */}
                                            {years.map((year) => (
                                                <td key={year}>
                                                    <CustomInput
                                                        id={`input-${key}-${year}`}
                                                        type="percentage"
                                                        value={values[key]?.[year] || ""}
                                                        onChange={(value) => handleChange(key, year, value)} 
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

                        {/* Sección de Análisis de mercadeo y ventas - analisisMercado */}
                        <div className="section">
                            <img src={tituloMercadeoImg} alt="Análisis del entorno" className="section-img5" />
                        </div>
                        <p>
                            En el plan de mercadeo y ventas, se debe realizar una estimación de las cantidades a facturar y los precios promedio de ventas para el primer año
                            por cada producto y/o servicio, así como también los factores de crecimiento (con base en indicador o estrategia) y el costo de cada
                            una de las estrategias de Marketing para atraer clientes.
                        </p>
                        <div className="analisis-info-container">
                            {/* Input Tasa IVA */}
                            <div className="tasa-iva">
                                <p>Para cada producto o linea de negocios establecida, determine las cantidades y precios del año uno (1er año).</p>
                                <label htmlFor="input-tasa-iva">Tasa IVA:</label>
                                <CustomInput
                                    id="input-tasa-iva"
                                    type="percentage"
                                    value={tasaIVA}
                                    onChange={setTasaIVA} 
                                />
                            </div>

                            {/* Tabla de productos - analisisMercado */}
                            <div className="proyeccion-container">
                                <table className="tabla-productos">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th className="producto-celda-nombre">Nombre del Producto</th>
                                            <th>Cantidad año {years[0]}</th>
                                            <th>Precio sin IVA año {years[0]}</th>
                                            <th>Precio de venta año {years[0]}</th>
                                            <th>
                                                <span
                                                    title="En el plan operativo, además de los procesos y demás elementos que contempla el protocolo, se debe establecer y registrar los costos variables, costos fijos y las inversiones requeridas en el proyecto.
              Determine el costo variable promedio para cada producto para el primer año (Debería ser menor al Precio de Venta)
              La diferencia entre el Precio de Venta y el Costo Variable Promedio por unidad, nos dará el Margen de Contribución del producto y/o Servicio"
                                                >
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
                                                        placeholder=""
                                                        type="text"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-cantidad-${producto.id}`}
                                                        value={producto.cantidad}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "cantidad", value)}
                                                        placeholder=""
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-precioSinIVA-${producto.id}`}
                                                        value={producto.precioSinIVA}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "precioSinIVA", value)}
                                                        placeholder=""
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-precioVenta-${producto.id}`}
                                                        value={producto.precioVenta}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "precioVenta", value)}
                                                        placeholder=""
                                                        type="number"
                                                    />
                                                </td>

                                                <td>
                                                    <CustomInput
                                                        id={`producto-costoVariable-${producto.id}`}
                                                        value={producto.costoVariable}
                                                        onChange={(value) => manejarCambioProducto(producto.id, "costoVariable", value)}
                                                        placeholder=""
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
                                    <button className="boton-agregar" onClick={agregarProducto}>
                                        + Agregar Producto
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Crecimiento en Unidades*/}
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

                        {/* Campos de Crecimiento en Unidades (Solo se activan si se elige Estrategia) */}
                        {opcionSeleccionadaUnidades === "Estrategia" && (
                            <div id="crecimiento-unidades-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo,
                                    indique los crecimientos porcentuales de las unidades para cada año.
                                </p>
                                <h3>Crecimiento en Unidades</h3>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span>
                                            <CustomInput
                                                id={`crecimiento-unidades-${anio}`}
                                                type="percentage"
                                                value={crecimientoUnidades[anio]}
                                                onChange={(value) => manejarCambioCrecUnidades(anio, value)}
                                                disabled={anio === years[0]} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Crecimiento en Precios*/}
                        <p>El crecimiento en PRECIOS depende de (marque en el recuadro con una X):</p>
                        <div id="crecimiento-precios" className="contenedor-crecimiento">
                            <CustomInput
                                id="opciones-crecimiento-precios"
                                label=""
                                type="radio"
                                value={opcionSeleccionadaPrecios}
                                onChange={manejarCambioPrecios}
                                options={["PIB", "Estrategia", "IPC"]}
                                name="metodoCrecimientoPrecios"
                            />
                        </div>

                        {/* Campos de Crecimiento en Precios (Solo se activan si se elige Estrategia) */}
                        {opcionSeleccionadaPrecios === "Estrategia" && (
                            <div id="crecimiento-precios-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo,
                                    indique los crecimientos porcentuales de precios de venta para cada año.
                                </p>
                                <h3>Crecimiento en Precios</h3>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span> {/* Título del año */}
                                            <CustomInput
                                                id={`crecimiento-unidades-${anio}`} 
                                                type="percentage"
                                                value={crecimientoPrecios[anio]}
                                                onChange={(value) => manejarCambioCrecPrecios(anio, value)}
                                                disabled={anio === years[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Crecimiento en Costos*/}
                        <p>El crecimiento en COSTOS variables por unidad depende de (marque en el recuadro con una X):</p>
                        <div id="crecimiento-costos" className="contenedor-crecimiento">
                            <CustomInput
                                id="opciones-crecimiento-costos"
                                label=""
                                type="radio"
                                value={opcionSeleccionadaCostos}
                                onChange={manejarCambioCostos}
                                options={["PIB", "Estrategia", "IPC"]}
                                name="metodoCrecimientoCostos"
                            />
                        </div>

                        {/* Campos de Crecimiento en Costos (Solo se activan si se elige Estrategia) */}
                        {opcionSeleccionadaCostos === "Estrategia" && (
                            <div id="crecimiento-costos-estrategia">
                                <p className="texto-estrategia">
                                    En caso de que su crecimiento sea mediante estrategias de mercadeo,
                                    indique los crecimientos porcentuales de precios de venta para cada año.
                                </p>
                                <h3>Crecimiento en Costos</h3>
                                <div className="fila-crecimiento">
                                    {years.map((anio) => (
                                        <div key={anio} className="contenedor-input">
                                            <span className="anio">Año {anio}</span> {/* Título del año */}
                                            <CustomInput
                                                id={`crecimiento-costos-${anio}`} 
                                                type="percentage"
                                                value={crecimientoCostos[anio]}
                                                onChange={(value) => manejarCambioCrecCostos(anio, value)}
                                                disabled={anio === years[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tabla estrategias marketingInvestAnoBase */}
                        <div className="section">
                            <img src={tituloAnalisiImg} alt="MARKETING" className="section-img1" />
                        </div>
                        <div className="marketing-invest-container">
                            <p>Nombre las estrategias de mercadeo a realizar en su proyecto y el gasto estimado para cada año, a fin de darse a conocer y atraer clientes en el mercado competitivo.
                            </p>
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
                                                        placeholder=""
                                                        type="text"
                                                    />
                                                </td>

                                                {years.map((anio) => (
                                                    <td key={`td-anio${anio}-${estrategia.id}`}>
                                                        <CustomInput
                                                            id={`estrategia-anio${anio}-${estrategia.id}`}
                                                            value={estrategia.valores?.[anio] || ""}
                                                            onChange={(value) => manejarCambioEstrategia(estrategia.id, anio, value)}
                                                            placeholder=""
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
                                    <button className="estrategia-boton-agregar" onClick={agregarEstrategia}>
                                        + Agregar Estrategia
                                    </button>
                                )}
                            </div>
                        </div>

                    </form>

                    {/* Botones de Navegación */}
                    <div className="buttons-container">
                        <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
                        <button className="nav-btn siguiente" onClick={handleSubmit}></button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProyeccionMacro