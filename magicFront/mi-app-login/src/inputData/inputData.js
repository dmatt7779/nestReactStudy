import React, { useState } from "react";

function InputData() {
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [integrantes, setIntegrantes] = useState([""]); // Array para los integrantes
  const [anoApertura, setAnoApertura] = useState("");
  const [proyeccionMacro, setProyeccionMacro] = useState({
    ipc: [0, 0, 0, 0, 0],
    devaluacion: [0, 0, 0, 0, 0],
    tasaInteres: [0, 0, 0, 0, 0],
    pib: [0, 0, 0, 0, 0],
  });

  const agregarIntegrante = () => {
    setIntegrantes([...integrantes, ""]);
  };

  const manejarCambioIntegrante = (indice, valor) => {
    const nuevosIntegrantes = [...integrantes];
    nuevosIntegrantes[indice] = valor;
    setIntegrantes(nuevosIntegrantes);
  };

  const handleInputChange = (campo, indice, valor) => {
    setProyeccionMacro((prevState) => ({
      ...prevState,
      [campo]: [...prevState[campo].slice(0, indice), valor, ...prevState[campo].slice(indice + 1)],
    }));
  };

  const [estrategiaUnidades, setEstrategiaUnidades] = useState(false);
  const [crecimientoCantidadesUnidades, setCrecimientoCantidadesUnidades] = useState([0, 0, 0, 0, 0]);
  const [estrategiaPrecios, setEstrategiaPrecios] = useState(false);
  const [crecimientoCantidadesPrecios, setCrecimientoCantidadesPrecios] = useState([0, 0, 0, 0, 0]);

  const handleInputChangeCantidad = (indice, valor, tipo) => {
        if (tipo === 'unidades') {
        setCrecimientoCantidadesUnidades((prevState) => ([...prevState.slice(0, indice), valor, ...prevState.slice(indice + 1)]));
        } else if (tipo === 'precios') {
        setCrecimientoCantidadesPrecios((prevState) => ([...prevState.slice(0, indice), valor, ...prevState.slice(indice + 1)]));
        }
    }

  const handleSubmit = (event) => {
    event.preventDefault();
    // Crear Json en Node o PHP para mandarlo a SQL y Python
    console.log("Nombre del Proyecto:", nombreProyecto);
    console.log("Integrantes:", integrantes);
    console.log("Año de Apertura:", anoApertura);
    console.log("Proyección Macro:", proyeccionMacro);
  };

  return (
    <div>
      <h2>Nuevo Proyecto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombreProyecto">Nombre del Proyecto:</label>
          <input
            type="text"
            id="nombreProyecto"
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="integrantes">Integrantes:</label>
          {integrantes.map((integrante, indice) => (
            <div key={indice}>
              <input
                type="text"
                value={integrante}
                onChange={(e) => manejarCambioIntegrante(indice, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={agregarIntegrante}>
            +
          </button>
        </div>
        <div>
          <label htmlFor="anoApertura">Año de Apertura:</label>
          <input
            type="number"
            id="anoApertura"
            value={anoApertura}
            onChange={(e) => setAnoApertura(e.target.value)}
            required
          />
        </div>

        <h3>Proyección Macro</h3>
        <h4>IPC</h4>
        {proyeccionMacro.ipc.map((valor, indice) => (
          <input
            key={indice}
            type="number"
            value={valor}
            onChange={(e) => handleInputChange("ipc", indice, parseFloat(e.target.value))}
          />
        ))}

        <h4>Devaluación</h4>
        {proyeccionMacro.devaluacion.map((valor, indice) => (
          <input
            key={indice}
            type="number"
            value={valor}
            onChange={(e) => handleInputChange("devaluacion", indice, parseFloat(e.target.value))}
          />
        ))}

        <h4>Tasa de Interés</h4>
        {proyeccionMacro.tasaInteres.map((valor, indice) => (
          <input
            key={indice}
            type="number"
            value={valor}
            onChange={(e) => handleInputChange("tasaInteres", indice, parseFloat(e.target.value))}
          />
        ))}

        <h4>PIB</h4>
        {proyeccionMacro.pib.map((valor, indice) => (
          <input
            key={indice}
            type="number"
            value={valor}
            onChange={(e) => handleInputChange("pib", indice, parseFloat(e.target.value))}
          />
        ))}

        <h2>Análisis de Mercado</h2>

        <h3>Crecimiento Unidades</h3>
        <div>
        <input
            type="checkbox"
            id="pibUnidades"
            name="crecimientoUnidades"
            value="PIB"
        />
        <label htmlFor="pibUnidades">PIB</label>
        </div>
        <div>
        <input
            type="checkbox"
            id="ipcUnidades"
            name="crecimientoUnidades"
            value="IPC"
        />
        <label htmlFor="ipcUnidades">IPC</label>
        </div>
        <div>
        <input
            type="checkbox"
            id="estrategiaUnidades"
            name="crecimientoUnidades"
            value="Estrategia"
            checked={estrategiaUnidades}
            onChange={() => setEstrategiaUnidades(!estrategiaUnidades)}
        />
        <label htmlFor="estrategiaUnidades">Estrategia</label>
        </div>

        {estrategiaUnidades && (
        <div>
            <h4>Crecimiento Cantidades (Unidades)</h4>
            {crecimientoCantidadesUnidades.map((valor, indice) => (
            <input
                key={indice}
                type="number"
                value={valor}
                onChange={(e) => handleInputChangeCantidad(indice, parseFloat(e.target.value), 'unidades')}
            />
            ))}
        </div>
        )}

        <h3>Crecimiento Precios</h3>
        <div>
        <input
            type="checkbox"
            id="pibPrecios"
            name="crecimientoPrecios"
            value="PIB"
        />
        <label htmlFor="pibPrecios">PIB</label>
        </div>
        <div>
        <input
            type="checkbox"
            id="ipcPrecios"
            name="crecimientoPrecios"
            value="IPC"
        />
        <label htmlFor="ipcPrecios">IPC</label>
        </div>
        <div>
        <input
            type="checkbox"
            id="estrategiaPrecios"
            name="crecimientoPrecios"
            value="Estrategia"
            checked={estrategiaPrecios}
            onChange={() => setEstrategiaPrecios(!estrategiaPrecios)}
        />
        <label htmlFor="estrategiaPrecios">Estrategia</label>
        </div>

        {estrategiaPrecios && (
        <div>
            <h4>Crecimiento Cantidades (Precios)</h4>
            {crecimientoCantidadesPrecios.map((valor, indice) => (
            <input
                key={indice}
                type="number"
                value={valor}
                onChange={(e) => handleInputChangeCantidad(indice, parseFloat(e.target.value), 'precios')}
            />
            ))}
        </div>
        )}

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
export default InputData;