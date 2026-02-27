import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style/styles.css';
import Titulo from "../images/titulo_simulador.png";
import lineImg from "../images/linea_divisora.png";
import axiosClient from '../utils/axios';
import toast from 'react-hot-toast';
import useProcessing from '../hooks/useProcessing';
import CeipaLoader from './CeipaLoader';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isProcessing, runWithLoader } = useProcessing();

  const handleSelect = async (path, section) => {
    setOpenDropdown(null);
    const projectId = sessionStorage.getItem("currentProjectId");
    
    if (!projectId) {
      toast.error('Ocurrió un error. No se encontró un ID de Proyecto Activo.');
      return;
    }

    if (section === "instrucciones") {

      navigate(path, { state: { projectId } });
    } else if (section === "resultados") {

      await runWithLoader(async () => {
        try {
          const response = await axiosClient.getResults(projectId);
          if (response && response.result) {
             navigate(path, { 
               state: { projectId, resultadosCalculados: response } 
             });
          } else {
             toast.error('Aún no hay resultados. Procesa el Plan Financiero primero.');
          }
        } catch (error) {
      
      
           if(error?.statusCode === 404 || error?.status === 404) {
               toast.error('Aún no existen resultados guardados calculados para este proyecto.', { duration: 6000 });
           }
        }
      });
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      sessionStorage.clear();
      navigate("/");
    }
  };
  let userRole = 'user';
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      if (decoded && decoded.role) {
        userRole = decoded.role;
      }
    } catch (e) {
      console.error("Error decoding token in Navbar", e);
    }
  }

  const isProfessor = userRole === 'professor';
  const showDropdowns = !isProfessor && location.pathname !== '/newProject' && location.pathname !== '/ProfessorDashboard';

  const showVerProyectos = isProfessor || (location.pathname !== '/ProfessorDashboard' && location.pathname !== '/newProject');

  return (
    <>
      {isProcessing && <CeipaLoader />}
      <div className="navbar">
        <img
          src={Titulo}
          alt="Simulación financiera, para planes de negocio y empresas by CEIPA"
          className="nav-title"
        />

        <div className="nav-buttons">
          {showDropdowns && (
            <>
              <div className="dropdown"
                onMouseEnter={() => setOpenDropdown("instrucciones")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="nav-btn" type="button">
                  Instrucciones ▾
                </button>

                {openDropdown === "instrucciones" && (
                  <ul className="dropdown-menu">
                    <li onClick={() => handleSelect("/projectInfo", "instrucciones")}>Información inicial</li>
                    <li onClick={() => handleSelect("/proyeccionMacro", "instrucciones")}>Análisis del entorno</li>
                    <li onClick={() => handleSelect("/costosGastos", "instrucciones")}>Costos y gastos</li>
                    <li onClick={() => handleSelect("/activosFijos", "instrucciones")}>Activos fijos</li>
                    <li onClick={() => handleSelect("/planFinanciero", "instrucciones")}>Plan financiero</li>
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
                    <li onClick={() => handleSelect("/estadoResultados", "resultados")}>Estado de resultados</li>
                    <li onClick={() => handleSelect("/flujoEfectivo", "resultados")}>Flujo de efectivo</li>
                    <li onClick={() => handleSelect("/estadoSituaFin", "resultados")}>Estado situación financiera</li>
                    <li onClick={() => handleSelect("/flujoCaja", "resultados")}>Flujo de caja</li>
                    <li onClick={() => handleSelect("/wacc", "resultados")}>WACC</li>
                    <li onClick={() => handleSelect("/indiFinancieros", "resultados")}>Indicadores financieros</li>
                    <li onClick={() => handleSelect("/indicadores", "resultados")}>Indicadores</li>
                  </ul>
                )}
              </div>
            </>
          )}

          {showVerProyectos && (
            <button 
              className="nav-btn" 
              onClick={() => navigate(isProfessor ? "/ProfessorDashboard" : "/newProject")}
            >
              {isProfessor ? "Ver asignaciones" : "Ver proyectos"}
            </button>
          )}
          {isProfessor && (
            <button 
              className="nav-btn" 
              onClick={() => navigate("/VerifiedProjects")}
            >
              Verificados
            </button>
          )}
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