
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/styles.css';
import emailIcon from "../images/icon-email.png";
import passIcon from "../images/passIcon.png";
import Footer from "../components/Footer";
import axiosClient from '../utils/axios';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.login({
        email: email,
        password: password,
      });
      if (response.token && response.payload.role) {
        localStorage.setItem('token', response.access_token);
        navigate('/dashboard');
      } else {
        setError('Error al iniciar sesión: No se recibió un token.');
      }
    } catch (err) {
      if (!err.response) {
        setError('Error de red. Verifica tu conexión.');
      } else if (err.response.status === 401) {
        setError('Credenciales incorrectas.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="left-panel"></div>
      <div className="divider_"></div>
      <div className="right-panel">
        <div className="title-imagen"></div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <img src={emailIcon} alt="Name Icon" className="input-icon" />
            <div className="divider"></div>
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <img src={passIcon} alt="Password Icon" className="input-icon" />
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
            <a href="aquiVaLaUrlparaRecuperarContrasena">Olvidé contraseña</a>
          </div>

          {/* Mensaje de error */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Botón de enviar con indicador de carga */}
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div>
            <label>¿No tienes cuenta? <Link to="/register">Regístrate</Link></label>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
export default Login;

