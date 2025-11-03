import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/styles.css";
import Titulo from "../images/titulo_simulador.png";
import lineImg from "../images/linea_divisora.png";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (path) => {
    navigate(path);
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      sessionStorage.clear();
      navigate("/login/index.js");
    }
  };

  return (
    <>
      <div className="navbar">
        <img
          src={Titulo}
          alt="Simulación financiera, para planes de negocio y empresas by CEIPA"
          className="nav-title"
        />

        <div className="nav-buttons">
          <div className="dropdown"
            onMouseEnter={() => setOpenDropdown("instrucciones")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="nav-btn" type="button">
              Instrucciones ▾
            </button>

            {openDropdown === "instrucciones" && (
              <ul className="dropdown-menu">
                <li onClick={() => handleSelect("/projectInfo")}>Información inicial</li>
                <li onClick={() => handleSelect("/proyeccionMacro")}>Análisis del entorno</li>
                <li onClick={() => handleSelect("/costosGastos")}>Costos y gastos</li>
                <li onClick={() => handleSelect("/activosFijos")}>Activos fijos</li>
                <li onClick={() => handleSelect("/planFinanciero")}>Plan financiero</li>
              </ul>
            )}
          </div>

          <div className="dropdown"
            onMouseEnter={() => setOpenDropdown("resultados")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="nav-btn" type="button">
              Resultados ▾
            </button>

            {openDropdown === "resultados" && (
              <ul className="dropdown-menu">
                <li onClick={() => handleSelect("/estadoResultados")}>Estado de resultados</li>
                <li onClick={() => handleSelect("/flujoEfectivo")}>Flujo de efectivo</li>
                <li onClick={() => handleSelect("/estadoSituaFin")}>Estado situación financiera</li>
                <li onClick={() => handleSelect("/flujoCaja")}>Flujo de caja</li>
                <li onClick={() => handleSelect("/wacc")}>WACC</li>
                <li onClick={() => handleSelect("/indiFinancieros")}>Indicadores financieros</li>
                <li onClick={() => handleSelect("/indicadores")}>Indicadores</li>
              </ul>
            )}
          </div>

          <button className="nav-btn" onClick={() => navigate("/newProject")}>
            Ver proyectos
          </button>
          <button className="nav-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="navbar-line">
        <img src={lineImg} alt="Línea decorativa" className="line-img" />
      </div>
    </>
  );
};

export default Navbar;
