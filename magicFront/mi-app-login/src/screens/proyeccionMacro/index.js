import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import analisisImg from "../../images/cabezote_analisis.png";
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png";
import tituloMercadeoImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png";
import tituloMarketingImg from "../../images/titulo_marketing_publicidad.png";

const ProyeccionMacro = () => {

  // ANALISIS DEL ENTORNO - proyecciones_macroeconomicas
  const navigate = useNavigate();

// Estado para almacenar los valores de la tabla - proyecciones_macroeconomicas
const [values, setValues] = useState({
  IPC: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" },
  Devaluation: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" },
  InterestRate: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" },
  PIB: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" },
});

// Función para manejar cambios en los inputs de Analisis del entorno
const handleChange = (category, year, value) => {
  setValues((prevValues) => ({
    ...prevValues,
    [category]: {
      ...prevValues[category],
      [year]: value,
    },
  }));
};

  // ANALISIS DE MERCADEO Y VENTAS

  // Estado para Tasa IVA
  const [tasaIVA, setTasaIVA] = useState("");

  // Estado para productos (máximo 10)
  const [productos, setProductos] = useState([
    { id: 1, nombre: "", cantidad: "", precioSinIVA: "", precioVenta: "", costoVariable: "" }
  ]);

  // Agregar un nuevo producto (máximo 10)
  const agregarProducto = () => {
    if (productos.length < 10) {
      setProductos([
        ...productos,
        { id: Date.now(), nombre: "", cantidad: "", precioSinIVA: "", precioVenta: "" }
      ]);
    }
  };
  

  // Eliminar un producto con confirmación
  const eliminarProducto = (id) => {
    const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (confirmarEliminar) {
      setProductos((productosAnteriores) => productosAnteriores.filter(producto => producto.id !== id));
    }
  };

  // Manejar cambios en los inputs de productos
  const manejarCambioProducto = (id, campo, valor) => {
    setProductos((productosAnteriores) =>
      productosAnteriores.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto
      )
    );
  };

  // Crecimiento en Unidades
  const [opcionSeleccionadaUnidades, setOpcionSeleccionadaUnidades] = useState("");
  const [crecimientoUnidades, setCrecimientoUnidades] = useState({
    2025: "", 2026: "", 2027: "", 2028: "", 2029: "",
  });

  const manejarCambioUnidades = (e) => {
    setOpcionSeleccionadaUnidades(e.target.value);
  };

  const manejarCambioCrecUnidades = (anio, valor) => {
    setCrecimientoUnidades((prev) => ({ ...prev, [anio]: valor }));
  };

    // Crecimiento en Precios
    const [opcionSeleccionadaPrecios, setOpcionSeleccionadaPrecios] = useState("");
    const [crecimientoPrecios, setCrecimientoPrecios] = useState({
      2025: "", 2026: "", 2027: "", 2028: "", 2029: "",
    });
  
    const manejarCambioPrecios = (e) => {
      setOpcionSeleccionadaPrecios(e.target.value);
    };
  
    const manejarCambioCrecPrecios = (anio, valor) => {
      setCrecimientoPrecios((prev) => ({ ...prev, [anio]: valor }));
    };

    // Estrategia MarketinInvesAnoBase

    const [estrategias, setEstrategias] = useState([
      { id: 1, nombre: "", cantidad: "", precioSinIVA: "", precioVenta: "", costoVariable: "" }
    ]);
  
    // Agregar un nuevo Estrategia (máximo 5)
    const agregarEstrategia = () => {
      if (estrategias.length < 5) {
        setEstrategias([
          ...estrategias,
          { id: Date.now(), nombre: "", anio1: "", anio2: "", anio3: "", anio4: "", anio5: "" }
        ]);
      }
    };
    
  
    // Eliminar un Estrategia con confirmación
    const eliminarEstrategia = (id) => {
      const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar esta estrategia?");
      if (confirmarEliminar) {
        setEstrategias((estrategiasAnteriores) => estrategiasAnteriores.filter(estrategia => estrategia.id !== id));
      }
    };
  
    // Manejar cambios en los inputs de Estrategia
    const manejarCambioEstrategia = (id, campo, valor) => {
      setEstrategias((estrategiasAnteriores) =>
        estrategiasAnteriores.map((estrategia) =>
          estrategia.id === id ? { ...estrategia, [campo]: valor } : estrategia
        )
      );
    };

        // Crecimiento en Costos
        const [opcionSeleccionadaCostos, setOpcionSeleccionadaCostos] = useState("");
        const [crecimientoCostos, setCrecimientoCostos] = useState({
          2025: "", 2026: "", 2027: "", 2028: "", 2029: "",
        });
      
        const manejarCambioCostos = (e) => {
          setOpcionSeleccionadaCostos(e.target.value);
        };
      
        const manejarCambioCrecCostos = (anio, valor) => {
          setCrecimientoCostos((prev) => ({ ...prev, [anio]: valor }));
        };

  // Enviar formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Valores enviados:", values);
    // Aquí podrías hacer una petición a la API para guardar los datos
  };

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
                    {[2025, 2026, 2027, 2028, 2029].map((year) => (
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
                      {[2025, 2026, 2027, 2028, 2029].map((year) => (
                        <td key={year}>
                          <CustomInput
                            id={`input-${key}-${year}`}  // Asignamos un ID único combinando categoría y año
                            type="percentage"
                            value={values[key][year]}  // Manejamos el estado con la estructura values[Categoría][Año]
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
                <p>Para cada producto o linea de negocios establecida, determine las cantidades y precios del año uno (1er año).
                </p>
                <label htmlFor="input-tasa-iva">Tasa IVA:</label> {/* Label asociado al ID */}
                <CustomInput 
                id="input-tasa-iva"  // ID único para este campo
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
                      <th>Cantidad año 2025</th>
                      <th>Precio sin IVA año 2025</th>
                      <th>Precio de venta año 2025</th>
                      <th>
                        <span
                          title="En el plan operativo, además de los procesos y demás elementos que contempla el protocolo, se debe establecer y registrar los costos variables, costos fijos y las inversiones requeridas en el proyecto.
              Determine el costo variable promedio para cada producto para el primer año (Debería ser menor al Precio de Venta)
              La diferencia entre el Precio de Venta y el Costo Variable Promedio por unidad, nos dará el Margen de Contribución del producto y/o Servicio"
                        >
                          Costo Variable por Unidad Año 2025 ℹ️
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
                  {Object.keys(crecimientoUnidades).map((anio) => (
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
            <div className="section">
              <img src={tituloMarketingImg} alt="Marteting" className="section-img6" />
            </div>
              <p>Nombre las estrategias de mercadeo a realizar en su proyecto y el gasto estimado para cada año, a fin de darse a conocer y atraer clientes en el mercado competitivo.
              </p>              
              <div className="proyeccion-container">
                <table className="tabla-estrategias">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="estrategia-celda-nombre">Nombre estrategia</th>
                      {[2025, 2026, 2027, 2028, 2029].map((anio) => (
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

                        {[1, 2, 3, 4, 5].map((num) => (
                          <td key={`td-anio${num}-${estrategia.id}`}>
                            <CustomInput
                              id={`estrategia-anio${num}-${estrategia.id}`}
                              value={estrategia[`anio${num}`]}
                              onChange={(value) => manejarCambioEstrategia(estrategia.id, `anio${num}`, value)}
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
            <button className="nav-btn siguiente" onClick={() => navigate("/costosGastos")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProyeccionMacro;