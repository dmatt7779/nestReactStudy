import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteActivos from "../../images/cabezote_activos_fijos.png";

// Configuración de secciones con campos condicionales
const SECCIONES = [
  { key: "muebles", label: "Muebles y enseres", hasVidaUtil: true, hasSalv: true },
  { key: "maquinaria", label: "Maquinaria y equipos", hasVidaUtil: true, hasSalv: true },
  { key: "vehiculos", label: "Vehículos", hasVidaUtil: true, hasSalv: true },
  { key: "terrenos", label: "Terrenos", hasVidaUtil: false, hasSalv: false },
  { key: "edificaciones", label: "Edificaciones", hasVidaUtil: true, hasSalv: true },
  { key: "equiposComputo", label: "Equipos de computo", hasVidaUtil: true, hasSalv: true },
  { key: "activosDiferidos", label: "Activos Diferidos (Software e intangibles)", hasVidaUtil: true, hasSalv: false }
];

// Genera un activo con ID único
const crearActivo = () => ({
  id: Date.now().toString() + Math.random().toString(36).substring(2),
  nombre: "",
  valor: ""
});

const ActivosFijos = () => {
  const navigate = useNavigate();

  // Estado general para activos por sección
  const [activosPorSec, setActivosPorSec] = useState(
    SECCIONES.reduce((acc, sec) => ({ ...acc, [sec.key]: [crearActivo()] }), {})
  );

  // Estados para vida útil y valor de salvamento por sección
  const [vidaUtilPorSec, setVidaUtilPorSec] = useState(
    SECCIONES.reduce((acc, sec) => ({ ...acc, [sec.key]: "" }), {})
  );
  const [salvPorSec, setSalvPorSec] = useState(
    SECCIONES.reduce((acc, sec) => ({ ...acc, [sec.key]: "" }), {})
  );

  // Agrega un nuevo activo en la sección indicada
  const agregarActivo = (key) => {
    setActivosPorSec((prev) => {
      const arr = prev[key];
      if (arr.length >= 10) return prev;
      return { ...prev, [key]: [...arr, crearActivo()] };
    });
  };

  // Elimina un activo por ID en la sección indicada
  const eliminarActivo = (key, id) => {
    if (window.confirm("¿Está seguro que desea eliminar el activo?")) {
      setActivosPorSec((prev) => ({
        ...prev,
        [key]: prev[key].filter((a) => a.id !== id)
      }));
    }
  };

  // Maneja cambios en nombre o valor
  const handleChange = (key, id, field, value) => {
    setActivosPorSec((prev) => ({
      ...prev,
      [key]: prev[key].map((a) => (a.id === id ? { ...a, [field]: value ?? "" } : a))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí envías activosPorSec, vidaUtilPorSec y salvPorSec al backend
    console.log({ activosPorSec, vidaUtilPorSec, salvPorSec });
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezoteActivos} alt="Robot" className="robot-img-an" />
        </div>
        <div className="contenido-container">
          <form onSubmit={handleSubmit}>
            {SECCIONES.map((sec) => (
              <div key={sec.key} className="activos-container">
                <h2 className="section-title">{sec.label}</h2>
                <div className="tabla-activos">
                  <table className="tabla-horizontal">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre del activo</th>
                        <th>Valor</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activosPorSec[sec.key].map((activo, idx) => (
                        <tr key={activo.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <CustomInput
                              value={activo.nombre}
                              onChange={(v) => handleChange(sec.key, activo.id, "nombre", v)}
                              placeholder="Nombre activo"
                              type="text"
                            />
                          </td>
                          <td>
                            <CustomInput
                              value={activo.valor}
                              onChange={(v) => handleChange(sec.key, activo.id, "valor", v)}
                              placeholder="0"
                              type="number"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="estrategia-boton-eliminar"
                              onClick={() => eliminarActivo(sec.key, activo.id)}
                              disabled={activosPorSec[sec.key].length === 1}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="campos-laterales">
                    {sec.hasVidaUtil && (
                      <label>
                        Vida útil en años
                        <CustomInput
                          value={vidaUtilPorSec[sec.key]}
                          onChange={(v) =>
                            setVidaUtilPorSec((prev) => ({ ...prev, [sec.key]: v }))
                          }
                          placeholder="Ej: 5"
                          type="number"
                        />
                      </label>
                    )}
                    {sec.hasSalv && (
                      <label>
                        Valor de salvamento
                        <CustomInput
                          value={salvPorSec[sec.key]}
                          onChange={(v) =>
                            setSalvPorSec((prev) => ({ ...prev, [sec.key]: v }))
                          }
                          placeholder="0"
                          type="number"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="boton-agregar"
                  onClick={() => agregarActivo(sec.key)}
                  disabled={activosPorSec[sec.key].length >= 10}
                >
                  + Agregar activo
                </button>
              </div>
            ))}
          </form>

          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/salariosAdmins")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActivosFijos;
