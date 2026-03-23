import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './screens/login';
import Register from './screens/register';
import ForgotPassword from './screens/forgotPassword';
import ResetPassword from './screens/resetPassword';
import NewProject from './screens/newProject';
import ProjectInfo from './screens/projectInfo';
import ProyeccionMacro from './screens/proyeccionMacro';
import CostosGastos from './screens/costosGastos';
import ActivosFijos from './screens/activosFijos';
import SalarioAdmins from './screens/salarioAdmins';
import PlanFinanciero from './screens/planFinanciero';
import EstadoResultados from './screens/results/estadoResultados';
import FlujoEfectivo from './screens/results/flujoEfectivo';
import EstadoSituaFin from './screens/results/estadoSituaFin';
import FlujoCaja from './screens/results/flujoCaja';
import Wacc from './screens/results/wacc';
import IndiFinancieros from './screens/results/indiFinancieros';
import Indicadores from './screens/results/indicadores';
import ProfessorDashboard from './screens/professorDashboard';
import VerifiedProjects from './screens/verifiedProjects';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return(
    <BrowserRouter> 
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{ 
            duration: 3000,
            style: { zIndex: 99999 }
        }} 
      />
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password" element={<ResetPassword />} /> 
        
        <Route element={<ProtectedRoute />}>
          <Route path="/ProjectInfo" element={<ProjectInfo />} /> 
          <Route path="/NewProject/" element={<NewProject />} />
          <Route path="/ProyeccionMacro/" element={<ProyeccionMacro />} />
          <Route path="/CostosGastos/" element={<CostosGastos />} />
          <Route path="/SalarioAdmins/" element={<SalarioAdmins />} />
          <Route path="/PlanFinanciero/" element={<PlanFinanciero />} />
          <Route path="/ActivosFijos/" element={<ActivosFijos />} />
          <Route path="/EstadoResultados/" element={<EstadoResultados />} />
          <Route path="/FlujoEfectivo/" element={<FlujoEfectivo />} />
          <Route path="/EstadoSituaFin/" element={<EstadoSituaFin />} />
          <Route path="/FlujoCaja/" element={<FlujoCaja />} />
          <Route path="/Wacc/" element={<Wacc />} />
          <Route path="/IndiFinancieros/" element={<IndiFinancieros />} />
          <Route path="/Indicadores/" element={<Indicadores />} />
          <Route path="/ProfessorDashboard/" element={<ProfessorDashboard />} />
          <Route path="/VerifiedProjects/" element={<VerifiedProjects />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
