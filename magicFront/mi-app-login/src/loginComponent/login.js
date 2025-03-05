
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import Footer from "../components/Footer";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Evitar que la página se recargue

    // Aquí iría la lógica para enviar las credenciales al backend
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
  };

  return (
    <div className="container">
      <div className="left-panel"></div>
      <div className="divider_"></div>
        <div className="right-panel">
          <div className="title-imagen"></div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-container">
            <span className="icon">&#128100;</span>
            <div className="divider"></div> 
              <label htmlFor="username">Usuario: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-container">
            <span className="icon">&#128274;</span>
            <div className="divider"></div> 
              <label htmlFor="password">Contraseña: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="options">
              <label>
                <input type="checkbox" /> Recuerdame
              </label>
              <a href="#">Olvidé contraseña</a>
            </div>
            <button type="submit">Iniciar sesión</button>
            <div>
            <label>¿No tienes cuenta? <Link to="register">Regístrate</Link></label>
            </div>
          </form>
      </div>
      <Footer /> {}
    </div>
  );
}
export default Login;

