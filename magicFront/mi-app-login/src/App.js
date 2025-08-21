
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './screens/login';
import Register from './screens/register';
import ProjectInfo from './screens/projectInfo';
import NewProject from './screens/newProject';
import ProyeccionMacro from './screens/proyeccionMacro';
import CostosGastos from './screens/costosGastos';
import PlanFinanciero from './screens/planFinanciero';
import SalarioAdmins from './screens/salarioAdmins';
import ActivosFijos from './screens/activosFijos';
import EstadoResultados from './screens/results/estadoResultados';
import FlujoEfectivo from './screens/results/flujoEfectivo';
import EstadoSituaFin from './screens/results/estadoSituaFin';
import FlujoCaja from './screens/results/flujoCaja';

function App() {
  return(
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/ProjectInfo" element={<ProjectInfo />} /> 
        <Route path="/NewProject/" element={<NewProject />} />
        <Route path="/ProyeccionMacro/" element={<ProyeccionMacro />} />
        <Route path="/CostosGastos/" element={<CostosGastos />} />
        <Route path="/PlanFinanciero/" element={<PlanFinanciero />} />
        <Route path="/SalarioAdmins/" element={<SalarioAdmins />} />
        <Route path="/ActivosFijos/" element={<ActivosFijos />} />
        <Route path="/EstadoResultados/" element={<EstadoResultados />} />
        <Route path="/FlujoEfectivo/" element={<FlujoEfectivo />} />
        <Route path="/EstadoSituaFin/" element={<EstadoSituaFin />} />
        <Route path="/FlujoCaja/" element={<FlujoCaja />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
