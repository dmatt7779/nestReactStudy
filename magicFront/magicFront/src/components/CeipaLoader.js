import React from "react";
import "./CeipaLoader.css";

const CeipaLoader = () => {
  return (
    <div className="ceipa-loader-overlay">
      <div className="ceipa-loader-container">
        <svg
          viewBox="0 0 520 140"
          className="ceipa-loader-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* === SHIELD === */}
          <g className="ceipa-shield" transform="translate(5, 0)">
            {/* Outer shield shape */}
            <path
              className="draw-line shield-outline"
              d="M10,8 L120,8 L120,95 Q120,130 65,138 Q10,130 10,95 Z"
              fill="none"
              stroke="#4a4f54"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Circle inside shield */}
            <circle
              className="draw-line shield-circle"
              cx="65"
              cy="70"
              r="44"
              fill="none"
              stroke="#4a4f54"
              strokeWidth="3"
            />

            {/* X cross — 2 diagonal lines extending past circle */}
            <line
              className="draw-line shield-cross1"
              x1="22" y1="27"
              x2="108" y2="113"
              stroke="#4a4f54"
              strokeWidth="3.5"
            />
            <line
              className="draw-line shield-cross2"
              x1="108" y1="27"
              x2="22" y2="113"
              stroke="#4a4f54"
              strokeWidth="3.5"
            />

            {/* Arrow tip top-left */}
            <polyline className="draw-line shield-arrow1" points="30,26 22,27 23,35" fill="none" stroke="#4a4f54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Arrow tip bottom-right */}
            <polyline className="draw-line shield-arrow2" points="100,114 108,113 107,105" fill="none" stroke="#4a4f54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Arrow tip top-right */}
            <polyline className="draw-line shield-arrow3" points="107,35 108,27 100,26" fill="none" stroke="#4a4f54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Arrow tip bottom-left */}
            <polyline className="draw-line shield-arrow4" points="23,105 22,113 30,114" fill="none" stroke="#4a4f54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* === SYMBOLS IN THE 4 QUADRANTS OF THE X === */}

            {/* 4-pointed star — TOP quadrant center ~(65, 48) */}
            <path
              className="draw-fill shield-star-top"
              d="M65,42 L63,47 L58,49 L63,51 L65,56 L67,51 L72,49 L67,47 Z"
              fill="#4a4f54"
              opacity="0"
            />

            {/* 4-pointed star — RIGHT quadrant center ~(88, 70) */}
            <path
              className="draw-fill shield-star-right"
              d="M88,64 L86,69 L81,71 L86,73 L88,78 L90,73 L95,71 L90,69 Z"
              fill="#4a4f54"
              opacity="0"
            />

            {/* Crescent moon — LEFT quadrant center ~(42, 70) */}
            <path
              className="draw-fill shield-moon-left"
              d="M48,61 Q36,70 48,79 Q39,76 39,70 Q39,64 48,61 Z"
              fill="#4a4f54"
              opacity="0"
            />

            {/* Crescent moon — BOTTOM quadrant center ~(65, 92), larger */}
            <path
              className="draw-fill shield-moon-bottom"
              d="M72,82 Q58,92 72,102 Q61,98 61,92 Q61,86 72,82 Z"
              fill="#4a4f54"
              opacity="0"
            />
          </g>

          {/* === CEIPA TEXT — using font for clean look === */}
          <text
            className="draw-line letter-C"
            x="150" y="100"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="95"
            fill="none"
            stroke="#4a4f54"
            strokeWidth="2"
          >C</text>
          <text
            className="draw-line letter-E"
            x="210" y="100"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="95"
            fill="none"
            stroke="#4a4f54"
            strokeWidth="2"
          >E</text>
          <text
            className="draw-line letter-I"
            x="272" y="100"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="95"
            fill="none"
            stroke="#4a4f54"
            strokeWidth="2"
          >I</text>
          <text
            className="draw-line letter-P"
            x="303" y="100"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="95"
            fill="none"
            stroke="#4a4f54"
            strokeWidth="2"
          >P</text>
          <text
            className="draw-line letter-A"
            x="370" y="100"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="95"
            fill="none"
            stroke="#4a4f54"
            strokeWidth="2"
          >A</text>
        </svg>

        <p className="ceipa-loader-text">Procesando tu plan financiero...</p>

        <div className="ceipa-loader-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default CeipaLoader;
