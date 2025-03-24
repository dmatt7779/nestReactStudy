import React from "react";

const CustomInput = ({ label, value, onChange, placeholder, type, options, name }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "percentage") {
      newValue = newValue.replace(/[^0-9]/g, "");
      if (newValue > 100) newValue = "100";
    } else if (type === "number") {
      newValue = newValue.replace(/[^0-9.]/g, "");
    } else if (type === "text") {  
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
              placeholder={placeholder}
              className="custom-input"
            />
            {type === "percentage" && <span className="percentage-symbol">%</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomInput;
