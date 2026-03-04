import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, CheckCircle, FileDown } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtrado dinámico por nombre de proyecto, nombre de estudiante o cédula
  const filteredProyectos = useMemo(() => {
    if (!searchTerm.trim()) return proyectos;
    const term = searchTerm.toLowerCase().trim();
    return proyectos.filter((project) => {
      // Buscar por nombre de proyecto
      if ((project.projectName || '').toLowerCase().includes(term)) return true;
      // Buscar por nombre o cédula del estudiante en teamMembers
      if (Array.isArray(project.teamMembers)) {
        return project.teamMembers.some(
          (member) =>
            (member.name || '').toLowerCase().includes(term) ||
            (member.id || '').toString().toLowerCase().includes(term)
        );
      }
      return false;
    });
  }, [proyectos, searchTerm]);

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
          <div className="professor-search-wrapper">
            <input
              type="text"
              className="professor-search-input"
              placeholder="Buscar por nombre de proyecto, estudiante o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="professor-search-icon" />
          </div>

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

              {filteredProyectos.length === 0 ? (
                <p className="professor-search-no-results">
                  No se encontraron proyectos que coincidan con "{searchTerm}".
                </p>
              ) : (
              <div className="professor-dashboard-grid">
                {filteredProyectos.map((project) => {
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
                      <div
                        className="professor-card-verify"
                        style={{ backgroundColor: '#1a237e' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            toast.loading('Generando reporte...', { id: 'report' });
                            await axiosClient.downloadReport(projectId);
                            toast.success('Reporte descargado.', { id: 'report' });
                          } catch (error) {
                            toast.error('Error al generar el reporte.', { id: 'report' });
                          }
                        }}
                      >
                        <FileDown size={14} />
                        <span>Descargar Reporte</span>
                      </div>
                      <div
                        className="professor-card-verify"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmVerify = window.confirm(`¿Deseas marcar el proyecto "${projectName}" como verificado?`);
                          if (!confirmVerify) return;
                          try {
                            await axiosClient.toggleVerification(projectId);
                            toast.success(`Proyecto "${projectName}" marcado como verificado.`);
                            setProyectos(prev => prev.filter(p => p.id !== projectId));
                          } catch (error) {
                            toast.error('Error al verificar el proyecto.');
                          }
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>Marcar verificado</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfessorDashboard;
