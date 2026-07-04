import React, { useState, useEffect, useRef } from "react";

// Helper: format a raw numeric string with thousand separators (dots)
// Input: "1234567.89" → Output: "1.234.567,89"
const formatWithThousands = (rawValue) => {
  if (!rawValue && rawValue !== "0") return "";
  const [intPart, decPart] = rawValue.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
};

const stripThousands = (displayValue) => {
  return displayValue.replace(/\./g, "").replace(/,/g, ".");
};
const toCommaDisplay = (rawValue) => {
  if (!rawValue && rawValue !== "0") return "";
  return String(rawValue).replace(".", ",");
};

// Helper: convert display value (with comma decimal) to raw with dot decimal
// Input: "3,5" → Output: "3.5"
const fromCommaDisplay = (displayValue) => {
  return displayValue.replace(",", ".");
};

const CustomInput = ({ label, value, onChange, placeholder, type, options, name, disabled }) => {
  // Internal display state for number inputs (shows thousand separators)
  const [displayValue, setDisplayValue] = useState("");
  // Internal display state for percentage inputs (shows comma as decimal)
  const [percentDisplay, setPercentDisplay] = useState("");
  const isInternalChange = useRef(false);

  // Sync display value when the prop value changes externally
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (type === "number") {
      setDisplayValue(formatWithThousands(value || ""));
    } else if (type === "percentage") {
      setPercentDisplay(toCommaDisplay(value || ""));
    }
  }, [value, type]);

  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "percentage") {
      // Permitir solo dígitos, coma, punto y guion
      newValue = newValue.replace(/[^0-9,.\-]/g, "");
      // Convertir puntos a comas (el usuario puede escribir con . o ,)
      newValue = newValue.replace(/\./g, ",");
      // Permitir solo un guion al inicio
      newValue = newValue.replace(/(?!^)-/g, "");
      // Permitir solo una coma decimal
      const parts = newValue.split(",");
      if (parts.length > 2) {
        newValue = parts[0] + "," + parts.slice(1).join("");
      }
      // Actualizar display con coma
      isInternalChange.current = true;
      setPercentDisplay(newValue);
      // Enviar al padre con punto decimal para el backend
      onChange(fromCommaDisplay(newValue));

    } else if (type === "number") {
      // Strip existing thousand separators, keep comma as decimal
      let raw = stripThousands(newValue);

      // Remove invalid chars (only digits, dot, allowed)
      raw = raw.replace(/[^0-9.]/g, "");

      // Ensure only one decimal point
      const parts = raw.split(".");
      if (parts.length > 2) {
        raw = parts[0] + "." + parts.slice(1).join("");
      }

      // Format for display with thousand separators
      const formatted = formatWithThousands(raw);

      isInternalChange.current = true;
      setDisplayValue(formatted);
      onChange(raw); // Send raw numeric value to parent

    } else if (type === "text") {
      newValue = newValue.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
      onChange(newValue);
    } else if (type === "textnum") {
      newValue = newValue.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s]/g, "");
      onChange(newValue);
    } else {
      onChange(newValue);
    }
  };

  const handleBlur = (e) => {
    if (type === "number") {
      const raw = stripThousands(e.target.value);
      if (!raw) return;

      const num = parseFloat(raw);
      if (!isNaN(num)) {
        const formatted = formatWithThousands(raw);
        isInternalChange.current = true;
        setDisplayValue(formatted);
        onChange(raw);
      }
    } else if (type === "percentage") {
      // Limpiar comas al final (ej: "3," → "3")
      let display = percentDisplay;
      if (display.endsWith(",")) {
        display = display.slice(0, -1);
        isInternalChange.current = true;
        setPercentDisplay(display);
        onChange(fromCommaDisplay(display));
      }
    }
  };

  // Determine what to show in the input
  const getInputValue = () => {
    if (type === "number") return displayValue;
    if (type === "percentage") return percentDisplay;
    return value;
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
              value={getInputValue()}
              onChange={handleChange}
              onBlur={handleBlur}
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
