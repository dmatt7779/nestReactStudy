import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../style/styles.css';
import Footer from "../../components/Footer";
import bgImage from "../../images/img_registro.png";
import emailIcon from "../../images/icon-email.png";
import passIcon from "../../images/passIcon.png";
import confirmIcon from "../../images/confirmIcon.png";
import axiosClient from '../../utils/axios';

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [mostrarErrorContrasena, setMostrarErrorContrasena] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [errorServidor, setErrorServidor] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (contrasena !== confirmarContrasena) {
            setMostrarErrorContrasena(true);
            return;
        }

        try {
            const response = await axiosClient.register({
                name: name,
                email: email,
                password: contrasena,
            });

            console.log('Registro exitoso:', response);
            setRegistroExitoso(true);

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
          console.error('Error al registrar:', error.response?.data || error.message);
          setErrorServidor(error.response?.data?.message || "Error al registrarse. Inténtalo de nuevo.");

        }
    };

    const validarContrasena = (contrasena, confirmarContrasena) => {
        if (contrasena !== confirmarContrasena) {
            setMostrarErrorContrasena(true);
        } else {
            setMostrarErrorContrasena(false);
        }
    };

    return (
        <div className="register-container">
            <img src={bgImage} alt="Registro de Usuarios" className="register-background" />
            <div className='register-form-r'>
            <form onSubmit={handleSubmit}>
                <div className='input-container-r'>
                    <img src={emailIcon} alt="Name Icon" className="input-icon" />
                    <div className="input-divider-r"></div> 
                        <label htmlFor="name">Nombre:</label>
                        <input
                            type="name"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                </div>
                <div className='input-container-r'>
                    <img src={emailIcon} alt="Email Icon" className="input-icon" />
                    <div className="input-divider-r"></div> 
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                </div>
                <div className='input-container-r'>
                <img src={passIcon} alt="Password Icon" className="input-icon" />
                <div className="input-divider-r"></div>       
                    <label htmlFor="contrasena">Contraseña:</label>
                    <input
                        type="password"
                        id="contrasena"
                        value={contrasena}
                        onChange={(e) => {
                            setContrasena(e.target.value);
                            validarContrasena(e.target.value, confirmarContrasena);
                        }}
                        required
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
                        />
                    <div className='input-container-r'> 
                        {errorServidor && <p style={{ color: 'red' }}>{errorServidor}</p>}
                        {mostrarErrorContrasena && (
                            <p style={{ color: 'red' }}>Las contraseñas no coinciden</p>
                        )}
                        {registroExitoso && (
                            <p style={{ color: 'green' }}>Registro exitoso! Redirigiendo...</p>
                        )}
                    </div>
                </div>
                <button type="submit">Registrarse</button>
                <div className='register-option'><p>¿Ya tienes cuenta? <Link to="/">Iniciar Sesión</Link></p> </div>
            </form>
            </div>
            <Footer />
        </div>
    );
}
export default Register;