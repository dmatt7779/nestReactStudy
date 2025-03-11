import React, { useState } from "react";
import '../style/styles.css';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Icon1 from '../images/edit-icon.png';
import Icon2 from '../images/delete-icon.png';
const NewProject = () => {
  const [projects, setProjects] = useState([
      { id: 1, name: "Proyecto 1" },
      { id: 2, name: "Proyecto 2" },
  ]);

   // Agregar un nuevo proyecto
    const addProject = () => {
        const newProject = { id: projects.length + 1, name: `Proyecto ${projects.length + 1}` };
        setProjects([...projects, newProject]);
    };

    // Editar un proyecto
    const editProject = (id) => {
        const newName = prompt("Nuevo nombre del proyecto:");
        if (newName) {
            setProjects(
                projects.map((project) =>
                    project.id === id ? { ...project, name: newName } : project
                )
            );
        }
    };

    // Eliminar un proyecto
    const deleteProject = (id) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar este proyecto?");
        if (confirmDelete) {
            setProjects(projects.filter((project) => project.id !== id));
        }
    };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Crear Json en Node o PHP para mandarlo a SQL y Python

  };

  return (
    <div className="container-pi ">
      <Navbar />
      <form onSubmit={handleSubmit}>
      <div className="title-imagen-pi"></div>
      <h2>Nuevo Proyecto</h2>
      <div>
          <button className="add-project-btn" onClick={addProject}>
                + Agregar Proyecto
            </button>
            <div className="project-grid">
                {projects.map((project) => (
                    <div key={project.id} className="project-card">
                        <h3>{project.name}</h3>
                        <div className="icons">
                          <button className="icon-btn" onClick={() => editProject(project.id)}>
                             <img src={Icon1} alt="Editar" className="icon" />
                          </button>
                          <button className="icon-btn" onClick={() => deleteProject(project.id)}>
                          <img src={Icon2} alt="Eliminar" className="icon" />
                          </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <button type="submit">Guardar</button>
      </form>
      <Footer />
    </div>
  );
}
export default NewProject;