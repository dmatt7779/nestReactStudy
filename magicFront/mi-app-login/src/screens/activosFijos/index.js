import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteActivos from "../../images/cabezote_activos_fijos.png";

// Configuración de secciones con campos condicionales
const SECCIONES = [
  { id: "muebles", nombre: "Muebles y enseres", campos: ["vidaUtil", "valorSalvamento"] },
  { id: "maquinaria", nombre: "Maquinaria y equipos", campos: ["vidaUtil", "valorSalvamento"] },
  { id: "vehiculos", nombre: "Vehículos", campos: ["vidaUtil", "valorSalvamento"] },
  { id: "terrenos", nombre: "Terrenos", campos: [] },
  { id: "edificaciones", nombre: "Edificaciones", campos: ["vidaUtil", "valorSalvamento"] },
  { id: "computo", nombre: "Equipos de cómputo", campos: ["vidaUtil", "valorSalvamento"] },
  { id: "intangibles", nombre: "Activos Diferidos (Software e intangibles)", campos: ["vidaUtil"] },
];

const ActivosFijos = () => {
  const navigate = useNavigate();

  const [secciones, setSecciones] = useState(() =>
    Object.fromEntries(
      SECCIONES.map(({ id }) => [id, [{ id: Date.now(), nombre: "", valor: "", vidaUtil: "", valorSalvamento: "" }]])
    )
  );

  const agregarActivo = (seccionId) => {
    if (secciones[seccionId].length < 100) {
      const nuevoActivo = {
        id: Date.now(),
        nombre: "",
        valor: "",
        vidaUtil: "",
        valorSalvamento: "",
      };
      setSecciones((prev) => ({
        ...prev,
        [seccionId]: [...prev[seccionId], nuevoActivo],
      }));
    }
  };

  const eliminarActivo = (seccionId, index) => {
    const confirmar = window.confirm("¿Está seguro que desea eliminar el activo?");
    if (confirmar) {
      setSecciones((prev) => ({
        ...prev,
        [seccionId]: prev[seccionId].filter((_, i) => i !== index),
      }));
    }
  };

  const handleChange = (seccionId, index, field, value) => {
    setSecciones((prev) => ({
      ...prev,
      [seccionId]: prev[seccionId].map((item, i) =>
        i === index ? { ...item, [field]: value ?? "" } : item
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", secciones);
    // Aquí podrías enviar al backend
  };

 return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezoteActivos} alt="Robot" className="robot-img-an" />
        </div>

        <div className="contenido-container">
          <p>
            Ingrese cada uno de los activos fijos necesarios al inicio del proyecto para conformar su infraestructura, determinando su clasificación en grupo y el valor.
          </p>
          <p>
            Ingrese además la vida útil de los activos, y el Valor de Salvamento o Valor Residual (Una estimación de venta de dichos activos luego de la vida útil registrada).
          </p>

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
                            <CustomInput
                              value={activo.nombre}
                              onChange={(e) => handleChange(id, index, "nombre", e)}
                              placeholder="Ej: Escritorio"
                              type="text"
                            />
                          </td>
                          <td>
                            <CustomInput
                              value={activo.valor}
                              onChange={(e) => handleChange(id, index, "valor", e)}
                              placeholder="0"
                              type="number"
                            />
                          </td>
                          {campos.includes("vidaUtil") && (
                            <td>
                              <CustomInput
                                value={activo.vidaUtil}
                                onChange={(e) => handleChange(id, index, "vidaUtil", e)}
                                placeholder="5"
                                type="number"
                              />
                            </td>
                          )}
                          {campos.includes("valorSalvamento") && (
                            <td>
                              <CustomInput
                                value={activo.valorSalvamento}
                                onChange={(e) => handleChange(id, index, "valorSalvamento", e)}
                                placeholder="0"
                                type="number"
                              />
                            </td>
                          )}
                          <td>
                            <button
                              type="button"
                              className="estrategia-boton-eliminar"
                              onClick={() => eliminarActivo(id, index)}
                              disabled={secciones[id].length === 1}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="boton-agregar"
                  onClick={() => agregarActivo(id)}
                  disabled={secciones[id].length >= 100}
                >
                  + Agregar activo
                </button>
              </div>
            ))}
          </form>

          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/salarioAdmins")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ActivosFijos;
