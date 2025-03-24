import React from "react";

const CustomInput = ({ label, value, onChange, placeholder, type, options, name, disabled }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "percentage") {
      newValue = newValue.replace(/[^0-9]/g, "");
      if (newValue > 100) newValue = "100";
    } else if (type === "number") {
      newValue = newValue.replace(/[^0-9.]/g, "");
    }

    onChange(newValue);
  };

  return (
    <div className="custom-input-container">
      {type === "radio" ? (
        <div className="radio-group">
          <label>{label}</label>
          {options.map((option, index) => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                id={`radio-${name}-${index}`} // Genera ID único dinámico
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
              placeholder={placeholder}
              className="custom-input"
              disabled={disabled} // 🔥 Agregamos la opción de deshabilitar el input
            />
            {type === "percentage" && <span className="percentage-symbol">%</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomInput;
