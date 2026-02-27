import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from "../../components/Footer";
import CeipaLoader from "../../components/CeipaLoader";
import useProcessing from "../../hooks/useProcessing";
import axiosClient from '../../utils/axios';
import '../../style/styles.css';

function ProfessorDashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isProcessing, runWithLoader } = useProcessing();

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.getProfessorProjects();
        if (response && Array.isArray(response)) {
          const proyectosOrdenados = response.sort((a, b) => b.id - a.id);
          setProyectos(proyectosOrdenados);
        } else {
          setProyectos([]);
        }
      } catch (err) {
        console.error("Error al obtener los proyectos de profesor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="nuevo-proyecto-container">
          <p>Cargando tus proyectos asignados...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      {isProcessing && <CeipaLoader />}
      <Navbar />
      <div className="nuevo-proyecto-container professor-dashboard-container">
        <div className="contenido-container professor-dashboard-content">
          <h2 className="professor-dashboard-title">Panel de Tutorías (Profesor)</h2>
          
          {proyectos.length === 0 ? (
            <p className="professor-dashboard-empty">
              Aún no tienes proyectos valorados o listos para revisión asignados a tu ID.
            </p>
          ) : (
            <>
              <p className="professor-dashboard-subtitle">
                A continuación se listan los proyectos que los estudiantes han valorado financieramente y te han asignado como tutor. Haz clic en cualquiera para revisar sus resultados financieros.
              </p>
              <div className="professor-dashboard-grid">
                {proyectos.map((project) => {
                  const projectId = project.id;
                  const projectName = project.projectName || "";
                  
                  const nameLength = projectName.length;
                  let dynamicFontSize = "15px";
                  let dynamicLineHeight = "1.2";
                  
                  if (nameLength > 24) {
                    dynamicFontSize = "11px";
                    dynamicLineHeight = "1.1";
                  } else if (nameLength > 14) {
                    dynamicFontSize = "13px";
                    dynamicLineHeight = "1.15";
                  }

                  return (
                    <div
                      key={projectId}
                      className="proyecto-card"
                      onClick={async () => {
                        sessionStorage.setItem("currentProjectId", projectId);
                        let navTarget = null;
                        await runWithLoader(async () => {
                          try {
                            const resultsResponse = await axiosClient.getResults(projectId);
                            if (resultsResponse && resultsResponse.result) {
                              navTarget = {
                                path: '/estadoResultados',
                                state: { projectId, resultadosCalculados: resultsResponse }
                              };
                            }
                          } catch (error) {
                            toast.error('No se pudieron cargar los resultados de este proyecto. El estudiante aún no ha guardado datos finales.');
                          }
                        });
                        
                        if (navTarget) {
                          navigate(navTarget.path, { state: navTarget.state });
                        }
                      }}
                    >
                      <div className="proyecto-card-activo">
                        <div className="card-top-activa">
                          <p 
                            className="card-titulo-activo" 
                            style={{ fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }}
                          >
                            {projectName}
                          </p>
                        </div>
                        <div className="card-bottom-activa professor-card-bottom">
                          <Eye size={16} />
                          <span>Ver resultados</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfessorDashboard;
