import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import Footer from "../components/Footer";
import bgImage from "../images/img_registro.png";
import emailIcon from "../images/icon-email.png";
import passIcon from "../images/passIcon.png";
import confirmIcon from "../images/confirmIcon.png";

function Registro() {
    const [proyecto, setProyecto] = useState('');
    const [estudiantes, setEstudiantes] = useState([{ nombre: '' }]);
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    const agregarEstudiante = () => {
        setEstudiantes([...estudiantes, { nombre: '' }]);
    };

    const manejarCambioEstudiante = (indice, valor) => {
        const nuevosEstudiantes = [...estudiantes];
        nuevosEstudiantes[indice].nombre = valor;
        setEstudiantes(nuevosEstudiantes);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Validar que las contraseñas coincidan
        if (contrasena !== confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Aquí iría la lógica para enviar los datos al backend
        console.log('Proyecto:', proyecto);
        console.log('Estudiantes:', estudiantes);
        console.log('Email:', email);
        console.log('Contraseña:', contrasena);
    };

    const [mostrarErrorContrasena, setMostrarErrorContrasena] = useState(false);

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
                    {mostrarErrorContrasena && (
                        <p style={{ color: 'red' }}>Las contraseñas no coinciden</p>
                    )}
                </div>
                <button type="submit">Registrarse</button>
                <div><p>¿Ya tienes cuenta? <Link to="/">Iniciar Sesión</Link></p> </div>
            </form>
            </div>
            <Footer />
        </div>
    );
}
export default Registro;