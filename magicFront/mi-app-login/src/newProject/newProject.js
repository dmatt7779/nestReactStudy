import React, { useState } from "react";
import '../styles.css';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import robotImg from '../images/robot.png';
import nuevoProyectoImg from "../images/bt_nuevo_proyecto.png";
//import Icon1 from '../images/edit-icon.png';
//import Icon2 from '../images/delete-icon.png';
const NewProject = () => {
  const proyectos = [1, 2, 3, 4, 5];

  return (
    <div className="nuevo-proyecto-container">
      <Navbar />
      <div className="robot-container">
         <img src={robotImg} alt="Robot" className="robot-img" />
      </div>
      <div className="contenido-container">
        <h1>Creación de un <span>nuevo proyecto</span></h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid-proyectos">
            {proyectos.map((_, index) => (
              <div key={index} className="proyecto-card">
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