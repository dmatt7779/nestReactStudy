
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './loginComponent/login';
import Registro from './registerComponent/register';
import InputData from './inputData/inputData';

function App() {
  return(
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Registro />} /> 
        <Route path="/InputData" element={<InputData />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
