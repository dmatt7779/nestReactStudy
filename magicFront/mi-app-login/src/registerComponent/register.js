import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="proyecto">Nombre del proyecto:</label>
                    <input
                        type="text"
                        id="proyecto"
                        value={proyecto}
                        onChange={(e) => setProyecto(e.target.value)}
                        required
                    />
                </div>
                <h3>Estudiantes:</h3>
                {estudiantes.map((estudiante, indice) => (
                    <div key={indice}>
                        <input
                            type="text"
                            value={estudiante.nombre}
                            onChange={(e) => manejarCambioEstudiante(indice, e.target.value)}
                            required
                        />
                        <button type="button" onClick={agregarEstudiante}>+</button>
                    </div>
                ))}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
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
                <div>
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
                <div><p>¿Ya tienes cuenta? <Link to="/">Iniciar Sesion</Link></p> </div>
            </form>
        </div>
    );
}
export default Registro;