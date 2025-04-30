import React from 'react';
import '../style/styles.css';
import { useNavigate } from "react-router-dom";
import Titulo from "../images/titulo_simulador.png";
import lineImg from "../images/linea_divisora.png"; // La imagen de la línea

function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <div className="navbar">
        <img
          src={Titulo}
          alt="Simulación financiera, para planes de negocio y empresas by CEIPA"
          className="nav-title"
        />

        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate('/newProject')}>Ver proyectos</button>
          <button className="nav-btn">Cerrar sesión</button>
        </div>
      </div>  
      <div className="navbar-line">
        <img src={lineImg} alt="Línea decorativa" className="line-img" />
      </div>
    </>
  );
}

export default Navbar;