import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/styles.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CustomInput from "../../components/CustomInput";
import cabezoteActivos from "../../images/cabezote_activos_fijos.png";

const categorias = [
    "Muebles y enseres",
    "Maquinaria y equipos",
    "Vehículos",
    "Terrenos",
    "Edificaciones",
    "Equipos de computo",
    "Activos Diferidos (Software e intangibles)"
  ];
  
  const ActivosFijos = () => {
    const navigate = useNavigate();
    const initialActivo = {
      nombre: "",
      valor: "",
      vidaUtil: "",
      valorSalvamento: ""
    };
  
    const [activosPorCategoria, setActivosPorCategoria] = useState(
      categorias.reduce((acc, categoria) => {
        acc[categoria] = Array(10).fill().map(() => ({ ...initialActivo }));
        return acc;
      }, {})
    );
  
    const handleChange = (categoria, index, field, value) => {
      const updated = [...activosPorCategoria[categoria]];
      updated[index][field] = value;
      setActivosPorCategoria({ ...activosPorCategoria, [categoria]: updated });
    };
  
    const agregarActivo = (categoria) => {
      setActivosPorCategoria({
        ...activosPorCategoria,
        [categoria]: [...activosPorCategoria[categoria], { ...initialActivo }]
      });
    };
  
    const eliminarActivo = (categoria, index) => {
      const updated = activosPorCategoria[categoria].filter((_, i) => i !== index);
      setActivosPorCategoria({ ...activosPorCategoria, [categoria]: updated });
    };
  
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="project-info-container">
      <Navbar />
      <div className="white-container-n">
        <div className="robot-container-an">
          <img src={cabezoteActivos} alt="Robot" className="robot-img-an" />
        </div>
        <div className="contenido-container">
          <p>
            Ingrese cada uno de los activos fijos necesarios al inicio del proyecto para conformar su infraestructura, determinando su clasificación en grupo y el valor.
         </p>
          <p>
            Ingrese además la vida útil de los activos, y el Valor de Salvamento o Valor Residual (Una estimación de venta de dichos activos luego de la vida útil registrada).
          </p>
          <form onSubmit={handleSubmit}>
            {/* Cargos */}
            <div className="activos-container">
      {categorias.map((categoria) => (
        <div key={categoria} className="categoria-section">
          <div className="categoria-title">{categoria}</div>
          <table className="activos-table">
            <thead>
              <tr>
                <th>Nombre del activo</th>
                <th>Valor</th>
                <th>Vida útil (años)</th>
                <th>Valor salvamento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activosPorCategoria[categoria].map((activo, index) => (
                <tr key={index}>
                  <td>
                    <CustomInput
                      value={activo.nombre}
                      onChange={(e) => handleChange(categoria, index, "nombre", e.target.value)}
                      type="text"
                    />
                  </td>
                  <td>
                    <CustomInput
                      value={activo.valor}
                      onChange={(e) => handleChange(categoria, index, "valor", e.target.value)}
                      type="number"
                    />
                  </td>
                  <td>
                    <CustomInput
                      value={activo.vidaUtil}
                      onChange={(e) => handleChange(categoria, index, "vidaUtil", e.target.value)}
                      type="number"
                    />
                  </td>
                  <td>
                    <CustomInput
                      value={activo.valorSalvamento}
                      onChange={(e) => handleChange(categoria, index, "valorSalvamento", e.target.value)}
                      type="number"
                    />
                  </td>
                  <td>
                    {activosPorCategoria[categoria].length > 10 && (
                      <button onClick={() => eliminarActivo(categoria, index)} className="eliminar-btn">Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => agregarActivo(categoria)} className="agregar-btn">Agregar activo</button>
        </div>
      ))}
    </div>


           
          </form>

          <div className="buttons-container">
            <button className="nav-btn anterior" onClick={() => navigate(-1)}></button>
            <button className="nav-btn siguiente" onClick={() => navigate("/salarioAdmins")}></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActivosFijos;
