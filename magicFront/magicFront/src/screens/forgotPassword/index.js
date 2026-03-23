import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../style/styles.css';
import emailIcon from "../../images/icon-email.png";
import Footer from "../../components/Footer";
import ParticleBackground from "../../components/ParticleBackground";
import axiosClient from '../../utils/axios';
import useProcessing from '../../hooks/useProcessing';
import CeipaLoader from '../../components/CeipaLoader';

function ForgotPassword() {
  const navigate = useNavigate();
  const { isProcessing, runWithLoader } = useProcessing();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await runWithLoader(async () => {
        const response = await axiosClient.forgotPassword({ email: email });
        setMessage(response.message || 'Si el correo existe, se han enviado las instrucciones.');
      });
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {isProcessing && <CeipaLoader />}
      <ParticleBackground particleCount={15000} />
      <div className="left-panel"></div>
      <div className="divider_"></div>
      <div className="right-panel">
        <div className="title-imagen"></div>
        <form className="login-form" onSubmit={handleSubmit}>
          
          <h2 className="forgot-password-title">Recuperar Contraseña</h2>
          <p className="forgot-password-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <div className="input-container">
            <img src={emailIcon} alt="Email Icon" className="input-icon" />
            <div className="divider"></div>
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="form-success-msg" style={{margin: '10px 0', padding: 0}}>{message}</p>}
          {error && <p className="form-error-msg" style={{margin: '10px 0', padding: 0}}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className='register-option' style={{marginTop: '20px'}}>
            <label>¿Recordaste tu contraseña? <Link to="/">Iniciar sesión</Link></label>
          </div>
        </form>
      </div>
      <Footer />
      <Footer />
    </div>
  );
}

export default ForgotPassword;
