import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../style/styles.css"
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import CustomInput from "../../components/CustomInput"
import analisisImg from "../../images/cabezote_analisis.png"
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png"
import tituloMercadeoImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png"
import axiosClient from "../../utils/axios"
import {AxiosError} from 'axios'

const ProyeccionMacro = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const projectId = location.state?.projectId
  const [openingYear, setOpeningYear] = useState(new Date().getFullYear().toString())
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [_proyeccionMacroData, setProyeccionMacroData] = useState(null)

  // Calcula los años a mostrar dinámicamente
  const calculateYears = useCallback((year) => {
    const startYear = parseInt(year, 10)
    return Array.from({ length: 5 }, (_, i) => startYear + i)
  }, [])

  const [years, setYears] = useState(() => calculateYears(openingYear))

  useEffect(() => {
    setYears(calculateYears(openingYear))
  }, [openingYear, calculateYears])

  // Estados para ANALISIS DEL ENTORNO - proyecciones_macroeconomicas
  const [values, setValues] = useState(() => {
    const categories = ["IPC", "Devaluation", "InterestRate", "PIB"]
    const initialValues = {}
    categories.forEach(category => {
      initialValues[category] = {};
    })
    years.forEach(year => {
      categories.forEach(category => {
        initialValues[category][year] = ""
      })
    })
    return initialValues
  })

  // Estados para ANALISIS DE MERCADEO Y VENTAS
  const [tasaIVA, setTasaIVA] = useState("")

  const [productos, setProductos] = useState([])

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

   const [estrategias, setEstrategias] = useState(() => {
     return [
       { nombre: "Fijación de Precios", valores: {} },
       { nombre: "Producto-Distribución", valores: {} },
       { nombre: "Comunicacionales", valores: {} },
       { nombre: "Comercialización", valores: {} },
       { nombre: "Community Manager", valores: {} },
     ].map(estrategia => {
       estrategia.valores = {}
       years.forEach(year => {
         estrategia.valores[year] = ""
       })
       return estrategia
     })
   })

  const [opcionSeleccionadaCostos, setOpcionSeleccionadaCostos] = useState("")

  const [crecimientoCostos, setCrecimientoCostos] = useState(() => {
    const initialCrecimiento = {}
    years.forEach(year => {
      initialCrecimiento[year] = ""
    })
    return initialCrecimiento
  })

  useEffect(() => {
    const fetchProyeccionMacro = async () => {
      setLoading(true)
      setError(null)
      setProyeccionMacroData(null)

      try {
        if (!projectId) {
          setError("projectId es requerido")
          return
        }

        try {
          // Primero, obtener el año de apertura
          const projectInfoResponse = await axiosClient.get(`/api/v1/project-info/${projectId}`)
          const openingYearFromApi = projectInfoResponse?.openingYear?.toString()
           setOpeningYear(openingYearFromApi || new Date().getFullYear().toString())

           // Calcula los años a mostrar dinámicamente
           setYears(() => calculateYears(openingYearFromApi || new Date().getFullYear().toString()))

          // Ahora, obtener los datos de ProyeccionMacro
          try {
            const response = await axiosClient.get(`/api/v1/proyeccion-macro/${projectId}`)
            setProyeccionMacroData(response)

            if (response) {
              // INICIALIZACION DE LOS ESTADOS DEL FORMULARIO //
              // ANALISIS DEL ENTORNO
              setValues((prevValues) => {
                const initialValues = { ...prevValues }
                const categories = ["IPC", "Devaluation", "InterestRate", "PIB"]
                categories.forEach(category => {
                  if (!initialValues[category]) {
                    initialValues[category] = {};
                  }
                  years.forEach((year, index) => {
                    let value
                    switch (category) {
                      case "IPC":
                        value = response.proyeccionesMacroEconomicas?.ipc?.[index] || ""
                        break
                      case "Devaluation":
                        value = response.proyeccionesMacroEconomicas?.devaluacion?.[index] || ""
                        break
                      case "InterestRate":
                        value = response.proyeccionesMacroeconomicas?.tasaInteres?.[index] || ""
                        break
                      case "PIB":
                        value = response.proyeccionesMacroeconomicas?.pib?.[index] || ""
                        break
                      default:
                        value = ""
                    }
                    initialValues[category][year] = value
                  })
                })
                return initialValues
              })

              // ANALISIS DE MERCADEO Y VENTAS
              setTasaIVA(response.analisisMercado?.tasaIva || "")

              setProductos((response.analisisMercado?.productos || []).map((producto, index) => ({
                id: producto.id || `product-${index}`,
                nombre: producto.nombre || "",
                cantidad: producto.cantidadFacturar || "",
                precioSinIVA: producto.precioSinIva || "",
                precioVenta: producto.precioVenta || "",
                costoVariable: producto.costoVarProdAnoBase || "",
              })))

              //Convertir el objeto de estrategias en un array con los valores actualizados
              setEstrategias((prevEstrategias) => {
                return prevEstrategias.map((estrategia) => {
                  estrategia.valores = {} // Reinicializa los valores para cada estrategia
                  years.forEach((year, index) => {
                   // Utiliza los datos del backend para llenar los valores de cada año
                   estrategia.valores[year] = response.analisisMercado?.marketingInvestAnoBase?.[estrategia.nombre === "Fijación de Precios" ? "precio" : estrategia.nombre === "Producto-Distribución" ? "producto" : estrategia.nombre === "Comunicacionales" ? "comunicacionales" : estrategia.nombre === "Comercialización" ? "distribucion" : "comunityManager"]?.[index] || ""
                  })
                  return estrategia
                })
              })

              // Actualizar los estados de crecimiento con la información de la API
              setCrecimientoUnidades((prevCrecimientoUnidades) => {
                const updatedCrecimientoUnidades = { ...prevCrecimientoUnidades }
                const crecimientoUnidadesData = response.analisisMercado?.crecimientoUnidades?.crecimientoCantidades || []
                years.forEach((year, index) => {
                  updatedCrecimientoUnidades[year] = crecimientoUnidadesData[index] || ""
                })
                return updatedCrecimientoUnidades
              })
              setCrecimientoPrecios((prevCrecimientoPrecios) => {
                const updatedCrecimientoPrecios = { ...prevCrecimientoPrecios }
                const crecimientoPreciosData = response.analisisMercado?.crecimientoPrecios?.crecimientoCantidades || []
                years.forEach((year, index) => {
                  updatedCrecimientoPrecios[year] = crecimientoPreciosData[index] || ""
                })
                return updatedCrecimientoPrecios
              })
              setCrecimientoCostos((prevCrecimientoCostos) => {
                const updatedCrecimientoCostos = { ...prevCrecimientoCostos }
                const crecimientoCostosData = response.analisisMercado?.crecimientoCostos?.crecimientoCantidades || []
                years.forEach((year, index) => {
                  updatedCrecimientoCostos[year] = crecimientoCostosData[index] || ""
                })
                return updatedCrecimientoCostos
              })
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
      } catch (err) {
        console.error("Error al obtener la proyeccion macro:", err)
        setError(err.message || "Error al obtener la proyeccion macro.")
      } finally {
        setLoading(false)
      }
    }

    fetchProyeccionMacro()
  }, [projectId, navigate])

  //Funciones
  const handleChange = (category, year, e) => {
    setValues((prevValues) => ({
      ...prevValues,
      [category]: {
        ...prevValues[category],
        [year]: e.target.value,
      },
    }))
  }

  const agregarProducto = () => {
    if (productos.length < 10) {
      setProductos([
        ...productos,
        { id: Date.now(), nombre: "", cantidad: "", precioSinIVA: "", precioVenta: "", costoVariable: "" }
      ])
    }
  }

  const eliminarProducto = (id) => {
    const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar este producto?")
    if (confirmarEliminar) {
      setProductos((productosAnteriores) => productosAnteriores.filter(producto => producto.id !== id))
    }
  }

  const manejarCambioProducto = (id, campo, e) => {
    setProductos((productosAnteriores) =>
      productosAnteriores.map((producto) => {
        if (producto.id === id) {
          return { ...producto, [campo]: e.target.value }
        }
        return producto
      })
    )
  }

  const manejarCambioUnidades = (e) => {
    setOpcionSeleccionadaUnidades(e.target.value)
  }

  const manejarCambioCrecUnidades = (anio, e) => {
    setCrecimientoUnidades((prev) => ({ ...prev, [anio]: e.target.value }))
  }

  const manejarCambioPrecios = (e) => {
    setOpcionSeleccionadaPrecios(e.target.value)
  }

  const manejarCambioCrecPrecios = (anio, e) => {
    setCrecimientoPrecios((prev) => ({ ...prev, [anio]: e.target.value }))
  }

  const manejarCambioEstrategia = (index, anio, e) => {
    const nuevasEstrategias = [...estrategias]
    nuevasEstrategias[index].valores[anio] = e.target.value
    setEstrategias(nuevasEstrategias)
  }

  const manejarCambioCostos = (e) => {
    setOpcionSeleccionadaCostos(e.target.value)
  }

  const manejarCambioCrecCostos = (anio, e) => {
    setCrecimientoCostos((prev) => ({ ...prev, [anio]: e.target.value }))
  }

  // Enviar formulario
  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!projectId) {
        setError("projectId es requerido para guardar los datos.")
        return
      }

      const dataToSend = {
        proyeccionesMacroeconomicas: {
          ipc: years.map(year => values.IPC[year] || 0),
          devaluacion: years.map(year => values.Devaluation[year] || 0),
          tasaInteres: years.map(year => values.InterestRate[year] || 0),
          pib: years.map(year => values.PIB[year] || 0),
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
            crecimientoCantidades: years.map(year => parseFloat(crecimientoUnidades[year]) || 0),
          },
          crecimientoPrecios: {
            crecimientoCantidades: years.map(year => parseFloat(crecimientoPrecios[year]) || 0),
          },
          marketingInvestAnoBase: {
            precio: years.map(year => parseFloat(estrategias[0].valores[year]) || 0),
            producto: years.map(year => parseFloat(estrategias[1].valores[year]) || 0),
            comunicacionales: years.map(year => parseFloat(estrategias[2].valores[year]) || 0),
            distribucion: years.map(year => parseFloat(estrategias[3].valores[year]) || 0),
            comunityManager: years.map(year => parseFloat(estrategias[4].valores[year]) || 0),
          },
          crecimientoCostos: {
            crecimientoCantidades: years.map(year => parseFloat(crecimientoCostos[year]) || 0),
          }
        }
      }

      const response = await axiosClient.post(`/api/v1/proyeccion-macro/${projectId}`, dataToSend)
      if (response) {
        navigate("/costosGastos")
      }
    } catch (error) {
      console.error("Error al guardar la proyeccion macro:", error)
      setError(error.message || "Error al guardar la proyeccion macro.")
    } finally {
      setLoading(false)
    }
  }

  // Renderizado condicional
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

          <form onSubmit={handleSubmit}>
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
                            id={`input-${key}-${year}`}  // Asignamos un ID único combinando categoría y año
                            type="percentage"
                            value={values[key]?.[year] || ""}  // Manejamos el estado con la estructura values[Categoría][Año]
                            onChange={(newValue) => handleChange(key, year, newValue)}
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
                <label htmlFor="input-tasa-iva">Tasa IVA:</label> {/* Label asociado al ID */}
                <CustomInput 
                id="input-tasa-iva"  // ID único para este campo
                type="percentage" 
                value={tasaIVA} 
                onChange={setTasaIVA} 
                />
              </div>

              {/* Tabla de productos - analisisMercado */}
              <div id="tabla-productos" className="productos-container">
                {productos.map((producto, index) => (
                  <div key={producto.id} className="fila-producto">
                    <span className="numero-producto">{index + 1}.</span> {/* Número del producto */}
                    <CustomInput
                      id={`producto-nombre-${producto.id}`} // ID único por producto
                      label="Nombre del Producto"
                      value={producto.nombre}
                      onChange={(value) => manejarCambioProducto(producto.id, "nombre", value)}
                      placeholder=""
                      type="text"
                    />
                    <CustomInput
                      id={`producto-cantidad-${producto.id}`} // ID único por producto
                      label="Cantidad año 2025"
                      value={producto.cantidad}
                      onChange={(value) => manejarCambioProducto(producto.id, "cantidad", value)}
                      placeholder=""
                      type="number"
                    />
                    <CustomInput
                      id={`producto-precioSinIVA-${producto.id}`} // ID único por producto
                      label="Precio sin IVA año 2025"
                      value={producto.precioSinIVA}
                      onChange={(value) => manejarCambioProducto(producto.id, "precioSinIVA", value)}
                      placeholder=""
                      type="number"
                    />
                    <CustomInput
                      id={`producto-precioVenta-${producto.id}`} // ID único por producto
                      label="Precio de venta año 2025"
                      value={producto.precioVenta}
                      onChange={(value) => manejarCambioProducto(producto.id, "precioVenta", value)}
                      placeholder=""
                      type="number"
                    />
                    <CustomInput
                      label={
                        <span title="En el plan operativo, además de los procesos y demás elementos que contempla el protocolo, se debe establecer y registrar los costos variables, costos fijos y las inversiones requeridas en el proyecto.
  Determine el costo variable promedio para cada producto para el primer año (Debería ser menor al Precio de Venta)
  La diferencia entre el Precio de Venta y el Costo Variable Promedio por unidad, nos dará el Margen de Contribución del producto y/o Servicio">
                            Costo Variable por Unidad Año 2025 ℹ️
                          </span>
                        }
                        id={`producto-costoVariable-${producto.id}`} // ID único por producto
                        value={producto.costoVariable}
                        onChange={(value) => manejarCambioProducto(producto.id, "costoVariable", value)}
                        placeholder=""
                        type="number"
                      />
                      <button className="boton-eliminar" onClick={() => eliminarProducto(producto.id)}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Botón para agregar más productos */}
                {productos.length < 10 && (
                  <button className="boton-agregar" onClick={agregarProducto}>+ Agregar Producto</button>
                )}
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
                        <span className="anio">Año {anio}</span> {/* Título del año */}
                        <CustomInput
                          id={`crecimiento-unidades-${anio}`}
                          type="percentage"
                          value={crecimientoUnidades[anio]}
                          onChange={(value) => manejarCambioCrecUnidades(anio, value)}
                          disabled={anio === "2025"} // ← Esto deshabilita solo el año 2025
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
                  {Object.keys(crecimientoPrecios).map((anio) => (
                    <div key={anio} className="contenedor-input">
                      <span className="anio">Año {anio}</span> {/* Título del año */}
                      <CustomInput
                        id={`crecimiento-unidades-${anio}`} // ID único para cada año
                        type="percentage"
                        value={crecimientoPrecios[anio]}
                        onChange={(value) => manejarCambioCrecPrecios(anio, value)}
                        disabled={anio === "2025"}
                      />
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Tabla estrategias marketingInvestAnoBase */}
              <div className="marketing-invest-container">
                <p>Nombre las estrategias de mercadeo a realizar en su proyecto y el gasto estimado para cada año, a fin de darse a conocer y atraer clientes en el mercado competitivo.
                </p>              
                <table className="marketing-table">
                  <thead>
                    <tr>
                      <th>Estrategia</th>
                      <th>Año 2025</th>
                      <th>Año 2026</th>
                      <th>Año 2027</th>
                      <th>Año 2028</th>
                      <th>Año 2029</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estrategias.map((estrategia, index) => (
                      <tr key={index}>
                        <td className="estrategia-nombre">{estrategia.nombre}</td>
                        {Object.keys(estrategia.valores).map((anio) => (
                          <td key={anio}>
                            <CustomInput
                              id={`estrategia-${index}-${anio}`} // ID único
                              type="number"
                              value={estrategia.valores[anio]}
                              onChange={(value) => manejarCambioEstrategia(index, anio, value)}
                              placeholder=""
                              required
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                
              {/* Crecimiento en Costos*/}
              <p>El crecimiento en costos variables por unidad depende de (marque en el recuadro con una X):</p>
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
                <h3>Crecimiento en Precios</h3>   
                <div className="fila-crecimiento">
                  {Object.keys(crecimientoCostos).map((anio) => (
                    <div key={anio} className="contenedor-input">
                      <span className="anio">Año {anio}</span> {/* Título del año */}
                      <CustomInput
                        id={`crecimiento-costos-${anio}`} // ID único para cada año
                        type="percentage"
                        value={crecimientoCostos[anio]}
                        onChange={(value) => manejarCambioCrecCostos(anio, value)}
                        disabled={anio === "2025"}
                      />
                    </div>
                  ))}
                </div>
              </div>
              )}

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