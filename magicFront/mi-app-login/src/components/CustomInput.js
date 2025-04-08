import React from "react";

const CustomInput = ({ label, value, onChange, placeholder, type, options, name, disabled }) => {
  //Función de cambia la coma por el punto
  const handleBlur = (e) => {
    if (type === "number") {
      let rawValue = e.target.value.replace(/\./g, "").replace(/,/g, ".");
      if (!rawValue) return;

      const num = parseFloat(rawValue);
      if (!isNaN(num)) {
        const formatted = num.toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

        onChange(num.toFixed(2)); // Valor limpio
        e.target.value = formatted; // Valor visual
      }
    }
  };

  const handleChange = (e) => {
    let newValue = e.target.value;  

    if (type === "percentage") {
      // Reemplaza comas por puntos
      newValue = newValue.replace(/,/g, ".");
      // Permitir solo dígitos, punto y guion
      newValue = newValue.replace(/[^0-9.\-]/g, "");
      // Permitir solo un guion al inicio
      newValue = newValue.replace(/(?!^)-/g, "");
      // Permitir solo un punto (si hay más, juntarlo)
      const parts = newValue.split(".");
      if (parts.length > 2) {
        newValue = parts[0] + "." + parts.slice(1).join("");
      }
      // Limitar a 2 decimales, si existe el punto
      if (newValue.indexOf(".") !== -1) {
        const [intPart, decPart] = newValue.split(".");
        newValue = intPart + "." + decPart.slice(0, 2);
      }
      }else if (type === "number") {
      // Reemplaza comas por puntos y elimina todo lo no válido
      let rawValue = newValue.replace(/,/g, ".").replace(/[^0-9.]/g, "");

      // Asegura solo un punto decimal
      const parts = rawValue.split(".");
      if (parts.length > 2) {
        rawValue = parts[0] + "." + parts.slice(1).join("");
      }

      // Limita a dos decimales
      if (rawValue.includes(".")) {
        const [entero, decimal] = rawValue.split(".");
        rawValue = entero + "." + decimal.slice(0, 2);
      }

      // Formatea con puntos de miles para mostrar
      const [intPart, decPart] = rawValue.split(".");
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      newValue = decPart !== undefined ? `${formatted}.${decPart}` : formatted;

      // Envía el valor real (sin puntos) a onChange
      onChange(rawValue);
      return;
    }else if (type === "text") {  
          newValue = newValue.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
        }

        onChange(newValue);
      };

  return (
    <div className="custom-input-container">
      {type === "radio" ? (
        <div className="radio-group">
          <label>{label}</label>
          {options.map((option) => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={onChange}
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <>
          <label>{label}</label>
          <div className="input-wrapper">
          <input
              type="text"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur} // 👈 nuevo evento agregado
              placeholder={placeholder}
              className="custom-input"
              disabled={disabled}
            />
            {type === "percentage" && <span className="percentage-symbol">%</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomInput;
