import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../style/styles.css';
import Footer from "../../components/Footer";
import bgImage from "../../images/img_registro.png";
import passIcon from "../../images/passIcon.png";
import confirmIcon from "../../images/confirmIcon.png";
import axiosClient from '../../utils/axios';
import useProcessing from '../../hooks/useProcessing';
import CeipaLoader from '../../components/CeipaLoader';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isProcessing, runWithLoader } = useProcessing();
    
    const [token, setToken] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [mostrarErrorContrasena, setMostrarErrorContrasena] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [errorServidor, setErrorServidor] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setErrorServidor('Enlace inválido. Serás redirigido al inicio...');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [location, navigate]);

    const validarContrasena = (pass1, pass2) => {
        if (pass1 !== pass2) {
            setMostrarErrorContrasena(true);
        } else {
            setMostrarErrorContrasena(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorServidor('');

        if (!token) {
            setErrorServidor('Enlace inválido. Por favor solicita un nuevo enlace.');
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setMostrarErrorContrasena(true);
            return;
        }

        if (contrasena.length < 6) {
            setErrorServidor('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            await runWithLoader(async () => {
                await axiosClient.resetPassword({
                    token: token,
                    newPassword: contrasena,
                });
                
                setRegistroExitoso(true);
            });
            
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            console.error('Error al restablecer:', error.message);
            setErrorServidor(error.message || "Error al restablecer la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            {isProcessing && <CeipaLoader />}
            <img src={bgImage} alt="Restablecer Contraseña" className="register-background" />
            <div className='register-form-r'>
            <form onSubmit={handleSubmit}>
                <h2 className="forgot-password-title">Crear Nueva Contraseña</h2>
                <p className="forgot-password-subtitle">
                    Ingresa tu nueva contraseña para acceder a la plataforma.
                </p>

                <div className='input-container-r'>
                    <img src={passIcon} alt="Password Icon" className="input-icon" />
                    <div className="input-divider-r"></div>       
                    <label htmlFor="contrasena">Nueva contraseña:</label>
                    <input
                        type="password"
                        id="contrasena"
                        value={contrasena}
                        onChange={(e) => {
                            setContrasena(e.target.value);
                            validarContrasena(e.target.value, confirmarContrasena);
                        }}
                        required
                        disabled={!token || registroExitoso}
                    />
                </div>
                
                <div className='input-container-r'>
                    <img src={confirmIcon} alt="Confirm Password Icon" className="input-icon" />
                    <div className="input-divider-r"></div>  
                    <label htmlFor="confirmarContrasena">Confirmar contraseña:</label>
                    <input
                        type="password"
                        id="confirmarContrasena"
                        value={confirmarContrasena}
                        onChange={(e) => {
                            setConfirmarContrasena(e.target.value);
                            validarContrasena(contrasena, e.target.value);
                        }}
                        required
                        disabled={!token || registroExitoso}
                    />
                </div>

                {/* Notificaciones */}
                {errorServidor && (
                    <p className="form-error-msg">{errorServidor}</p>
                )}
                {mostrarErrorContrasena && (
                    <p className="form-error-msg">Las contraseñas no coinciden</p>
                )}
                {registroExitoso && (
                    <p className="form-success-msg">
                        ¡Contraseña actualizada exitosamente! Redirigiendo al login...
                    </p>
                )}

                <button type="submit" disabled={!token || loading || registroExitoso || mostrarErrorContrasena || contrasena.length < 6}>
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
                
                <div className='register-option' style={{marginTop: '20px'}}>
                    <p><Link to="/">Volver a Iniciar Sesión</Link></p>
                </div>
            </form>
            </div>
            <Footer />
        </div>
    );
}
export default ResetPassword;
