import React, { useState, useEffect, useRef } from "react";

// Helper: format a raw numeric string with thousand separators (dots)
// Input: "1234567.89" → Output: "1.234.567,89"
const formatWithThousands = (rawValue) => {
  if (!rawValue && rawValue !== "0") return "";
  const [intPart, decPart] = rawValue.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
};

// Helper: strip thousand dots and convert display comma to raw dot
// Input: "1.234.567,89" → Output: "1234567.89"
const stripThousands = (displayValue) => {
  // Remove all dots (thousand separators), then convert comma to dot (decimal)
  return displayValue.replace(/\./g, "").replace(/,/g, ".");
};

const CustomInput = ({ label, value, onChange, placeholder, type, options, name, disabled }) => {
  // Internal display state for number inputs (shows thousand separators)
  const [displayValue, setDisplayValue] = useState("");
  const isInternalChange = useRef(false);

  // Sync display value when the prop value changes externally
  useEffect(() => {
    if (type === "number" && !isInternalChange.current) {
      setDisplayValue(formatWithThousands(value || ""));
    }
    isInternalChange.current = false;
  }, [value, type]);

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
      // Allow unlimited decimals after the point
      onChange(newValue);

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
    }
  };

  // Determine what to show in the input
  const inputValue = type === "number" ? displayValue : value;

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
              value={inputValue}
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
