import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import '../../style/styles.css';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import analisisImg from "../../images/cabezote_analisis.png";       
import tituloAnalisiImg from "../../images/titulo_analisis_de_entorno.png";    
import titulomerveImg from "../../images/titulo_analisis_de_mercadeo_y_ventas.png";        

const AnalisisInfo = (name,) => {
  const navigate = useNavigate();

  // Estados para la tabla de análisis del entorno
  const anios = [2025, 2026, 2027, 2028, 2029];
  const [proyeccion, setProyeccion] = useState({
    ipc: ["", "", "", "", ""],
    devaluacion: ["", "", "", "", ""],
    tasaInteres: ["", "", "", "", ""],
    pib: ["", "", "", "", ""],
  });

  const handleChangeProyeccion = (e, campo, index) => {
    const value = e.target.value;
    setProyeccion((prev) => ({
      ...prev,
      [campo]: prev[campo].map((val, i) => (i === index ? value : val)),
    }));
  };

  
  // Estados para la tabla de productos/servicios
  const [numProductos, setNumProductos] = useState(0);
  const [productos, setProductos] = useState([]);

  const handleNumProductosChange = (e) => {
    let cantidad = parseInt(e.target.value, 10) || 0;

    // Limitar el número de productos a 10
    if (cantidad > 10) {
      cantidad = 10;
    }

    setNumProductos(cantidad);
    setProductos(Array(cantidad).fill(""));
  };

  const handleProductoChange = (index, value) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = value;
    setProductos(nuevosProductos);
  };

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación de campos vacíos en ambas tablas
    const camposVaciosProyeccion = Object.values(proyeccion).some((valores) =>
      valores.includes("")
    );
    const camposVaciosProductos = productos.some((producto) => producto.trim() === "");

    if (camposVaciosProyeccion || camposVaciosProductos) {
      alert("Todos los campos son obligatorios");
      return;
    }

    console.log("Datos guardados:", { proyeccion, productos });

    // Aquí puedes enviar los datos a la base de datos con Axios u otro método
  };

    // Estado para la selección del crecimiento en unidades
    const [metodoCrecimiento, setMetodoCrecimiento] = useState("");
    const [crecimiento, setCrecimiento] = useState({
      2026: "",
      2027: "",
      2028: "",
      2029: "",
    });
  
    const handleMetodoChange = (e) => {
      setMetodoCrecimiento(e.target.value);
    };
  
    const handleCrecimientoChange = (e, anio) => {
      setCrecimiento({
        ...crecimiento,
        [anio]: e.target.value,
      });
    };

    // Estado para la selección del crecimiento en precios
const [metodoCrecimientoPrecios, setMetodoCrecimientoPrecios] = useState("");
const [crecimientoPrecios, setCrecimientoPrecios] = useState({
  2026: "",
  2027: "",
  2028: "",
  2029: "",
});

const handleMetodoCrecimientoPreciosChange = (e) => {
  setMetodoCrecimientoPrecios(e.target.value);
};

const handleCrecimientoPreciosChange = (e, anio) => {
  setCrecimientoPrecios({
    ...crecimientoPrecios,
    [anio]: e.target.value,
  });
};

// Estado para la tasa de IVA
const [tasaIVA, setTasaIVA] = useState("");

const handleTasaIVAChange = (e) => {
  let value = e.target.value;

  // Validar que solo ingrese números y máximo 100%
  if (!isNaN(value) && value >= 0 && value <= 100) {
    setTasaIVA(value);
  }
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
          En el análisis del entorno, es necesario Investigar y contemplar las proyecciones de ciertas variables Macroeconómicas.
          En este aspecto, existen entidades que se encargan de realizar estos estudios, y los publican en sus portales digitales.</p>          <div className="table-container">
            <form onSubmit={handleSubmit}>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {anios.map((anio) => (
                      <th key={anio}>Año {anio}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["ipc", "devaluacion", "tasaInteres", "pib"].map((campo, idx) => (
                    <tr key={idx}>
                      <td>
                        {campo === "ipc"
                          ? "IPC"
                          : campo === "devaluacion"
                          ? "Re / Devaluación"
                          : campo === "tasaInteres"
                          ? "Tasa de interés Efectiva Anual"
                          : "PIB"}
                      </td>
                      {proyeccion[campo].map((valor, index) => (
                        <td key={index}>
                          <input
                            type="text"
                            className="percentage-input"
                            value={valor}
                            onChange={(e) => handleChangeProyeccion(e, campo, index)}
                            placeholder="%"
                            required
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">
                Fuente: Proyecciones Macroeconómicas Bancolombia, Davivienda, BBVA, entre otros
              </div>
            </form>
          </div>

          {/* Sección de Análisis de Mercadeo y Ventas */}
          <div className="section">
            <img src={titulomerveImg} alt="Análisis de mercadeo y ventas" className="section-img5" />
          </div>
          <p>En el plan de mercadeo y ventas, se debe realizar una estimación de las cantidades a facturar y los precios promedio de ventas para el primer año por cada producto y/o servicio, así como también los factores de crecimiento (con base en indicador o estrategia) y el costo de cada una de las estrategias de Marketing para atraer clientes.</p>
          <form onSubmit={handleSubmit} className="productos-form">
            <label>Ingrese el número de productos o servicios:</label>
            <input
              type="number"
              min="0"
              max="10"
              value={numProductos}
              onChange={handleNumProductosChange}
              required
            />

            <table className="productos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Producto o Servicio</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="producto-input"
                        value={producto}
                        onChange={(e) => handleProductoChange(index, e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Sección de Crecimiento */}
          <div className="crecimiento-container">
            <p>El crecimiento en UNIDADES depende de (marque en el recuadro con una X):</p>
            <label>
              <input
                type="radio"
                name="crecimiento"
                value="PIB"
                onChange={handleMetodoChange}
              />
              PIB
            </label>
            <label>
              <input
                type="radio"
                name="crecimiento"
                value="Estrategia"
                onChange={handleMetodoChange}
              />
              Estrategia
            </label>
            <label>
              <input
                type="radio"
                name="crecimiento"
                value="IPC"
                onChange={handleMetodoChange}
              />
              IPC
            </label>

            {metodoCrecimiento === "Estrategia" && (
              <div>
                <p>En caso de que su crecimiento sea mediante estrategias de mercadeo, indique los crecimientos porcentuales de las unidades para cada año
                </p>
                <table className="crecimiento-table">
                  <thead>
                    <tr>
                      {anios.map((anio) => (
                        <th key={anio}>Año {anio}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {anios.map((anio) => (
                        <td key={anio}>
                          {anio === 2025 ? (
                            <input type="text" disabled placeholder="-" className="disabled-input"/>
                          ) : (
                            <input
                              type="text"
                              value={crecimiento[anio] || ""}
                              onChange={(e) => handleCrecimientoChange(e, anio)}
                              placeholder="%"
                              required
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Sección de Crecimiento en Precios */}
          <div className="crecimiento-container">
            <p>El crecimiento en PRECIOS depende de (marque en el recuadro con una X):</p>
            <label>
              <input
                type="radio"
                name="crecimientoPrecios"
                value="PIB"
                onChange={handleMetodoCrecimientoPreciosChange}
              />
              PIB
            </label>
            <label>
              <input
                type="radio"
                name="crecimientoPrecios"
                value="Estrategia"
                onChange={handleMetodoCrecimientoPreciosChange}
              />
              Estrategia
            </label>
            <label>
              <input
                type="radio"
                name="crecimientoPrecios"
                value="IPC"
                onChange={handleMetodoCrecimientoPreciosChange}
              />
              IPC
            </label>

            {metodoCrecimientoPrecios === "Estrategia" && (
              <div>
                <p>En caso de que su crecimiento sea mediante estrategias de mercadeo, indique los crecimientos porcentuales de precios de venta para cada año
                </p>
                <table className="crecimiento-table">
                  <thead>
                    <tr>
                      {[2025, 2026, 2027, 2028, 2029].map((anio) => (
                        <th key={anio}>Año {anio}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {[2025, 2026, 2027, 2028, 2029].map((anio) => (
                        <td key={anio}>
                          {anio === 2025 ? (
                            <input type="text" disabled placeholder="-" className="disabled-input"/>
                          ) : (
                            <input
                              type="text"
                              value={crecimientoPrecios[anio] || ""}
                              onChange={(e) => handleCrecimientoPreciosChange(e, anio)}
                              placeholder="%"
                              required
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="iva-container">
            <p>Para cada producto o linea de negocios establacida, determine las cantidades y precios del año uno (1er año)
            </p>
            <h3>Tasa IVA (%)</h3>
            <input
              type="number"
              id="tasaIVA"
              value={tasaIVA}
              onChange={handleTasaIVAChange}
              placeholder="Ej: 19"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="productos-container">
            <h3>Lista de Productos</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Producto</th>
                  <th>Cantidad Año 2025</th>
                  <th>Precio sin IVA Año 2025</th>
                  <th>Precio de Venta Año 2025</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="producto-input nombre-input"
                        value={producto.nombre}
                        onChange={(e) => handleProductoChange(index, "nombre", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="producto-input"
                        value={producto.cantidad}
                        onChange={(e) => handleProductoChange(index, "cantidad", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="producto-input"
                        value={producto.precioSinIVA}
                        onChange={(e) => {
                          handleProductoChange(index, "precioSinIVA", e.target.value);
                          /*calcularPrecioVenta(index, e.target.value);*/
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="producto-input"
                        value={producto.precioVenta}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



           </form>

          {/* Botones de Navegación */}
          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/newProject")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalisisInfo;
