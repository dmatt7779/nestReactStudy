
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './loginComponent';
import Registro from './registerComponent';
import ProjectInfo from './projectInfo';
import ProyeccionMacro from './proyeccionMacro';
import NewProject from './newProject';

function App() {
  return(
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Registro />} /> 
        <Route path="/ProjectInfo" element={<ProjectInfo />} /> 
        <Route path="/ProyeccionMacro" element={<ProyeccionMacro />} /> 
        <Route path="/NewProject/" element={<NewProject />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
