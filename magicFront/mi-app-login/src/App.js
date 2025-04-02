
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './screens/login';
import Register from './screens/register';
import ProjectInfo from './screens/projectInfo';
import NewProject from './screens/newProject';
import ProyeccionMacro from './screens/proyeccionMacro';
import CostosGastos from './screens/costosGastos';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
