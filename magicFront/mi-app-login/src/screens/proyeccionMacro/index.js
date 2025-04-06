import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";

import analisisImg from "../../images/cabezote_analisis.png";
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png";
import tituloMercadeoImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png";

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
      { nombre: "Fijación de Precios", valores: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" } },
      { nombre: "Producto-Distribución", valores: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" } },
      { nombre: "Comunicacionales", valores: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" } },
      { nombre: "Comercialización", valores: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" } },
      { nombre: "Community Manager", valores: { 2025: "", 2026: "", 2027: "", 2028: "", 2029: "" } },
    ]);
    
    const manejarCambioEstrategia = (index, anio, valor) => {
      const nuevasEstrategias = [...estrategias];
      nuevasEstrategias[index].valores[anio] = valor;
      setEstrategias(nuevasEstrategias);
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
                      id={`producto-costoVariable-${producto.id}`} // Nuevo campo con ID único
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
            <button className="nav-btn siguiente" onClick={() => navigate("/costosGastos")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProyeccionMacro;