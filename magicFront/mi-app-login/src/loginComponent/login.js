



import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <h2>Inicio de sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Iniciar sesión</button>
        <div><p>¿No tienes cuenta? <Link to="register">Regístrate</Link></p> </div>
      </form>
    </div>
  );
}
export default Login;