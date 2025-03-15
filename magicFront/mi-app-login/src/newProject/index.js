import React, { useState } from "react";
import '../style/styles.css';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import robotImg from '../images/robot2.png';
import nuevoProyectoImg from "../images/bt_nuevo_proyecto.png";
import tituloProyectoImg from "../images/titulo_nuevo_proyecto.png";
//import Icon1 from '../images/edit-icon.png';
//import Icon2 from '../images/delete-icon.png';
import { useNavigate } from 'react-router-dom';
const NewProject = () => {
  const proyectos = [1, 2, 3, 4, 5];
  const navigate = useNavigate();  // Agregamos useNavigate

  return (
    <div className="nuevo-proyecto-container">
     
      <div className="robot-container">
         <img src={robotImg} alt="Robot" className="robot-img" />
      </div>
      <div className="contenido-container">
        <div className="titulo-imagen">
          <img 
            src={tituloProyectoImg} 
            alt="Creación de un nuevo proyecto" 
            className="project-title-img" 
          />
        </div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
        <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid-proyectos">
            {proyectos.map((_, index) => (
              <div 
                key={index} 
                className="proyecto-card" 
                onClick={() => navigate('/projectInfo')}  // Navega al hacer clic
                  >
                <div className="imagen-hover">
                  <img src={nuevoProyectoImg} alt="Nuevo Proyecto" className="proyecto-img" />
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default NewProject;