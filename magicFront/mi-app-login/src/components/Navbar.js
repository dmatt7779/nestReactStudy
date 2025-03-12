import React from 'react';
import '../styles.css';
import Titulo from "../images/titulo_simulador.png";
import lineImg from "../images/linea_divisora.png"; // La imagen de la línea
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();


  return (
    <div className="navbar">
      <img src={Titulo} alt="Logo" className="navbar-logo" />
      <div className="navbar-right">
        <button className="nav-button" onClick={() => navigate('/newProject')}>
          Ver proyectos
        </button>
        <button className="nav-button">Cerrar sesión</button>
      </div>
      <div className="navbar-line">
        <img src={lineImg} alt="Decorative line" className="line-img" />
      </div>
    </div>
  
);
}

export default Navbar;
