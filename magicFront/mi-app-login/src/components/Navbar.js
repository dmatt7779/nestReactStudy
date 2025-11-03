import React from 'react';
import '../style/styles.css';
import Titulo from "../images/titulo_simulador.png";
import lineImg from "../images/linea_divisora.png"; // La imagen de la línea
//import { useNavigate } from 'react-router-dom';

  //const navigate = useNavigate();

  function Navbar() {
    return (
      <>
        <div className="navbar">
          <img
            src={Titulo}
            alt="Simulación financiera, para planes de negocio y empresas by CEIPA"
            className="nav-title"
          />
  
          <div className="nav-buttons">
            <button className="nav-btn">Ver proyectos</button>
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