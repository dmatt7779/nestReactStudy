import React, { useRef, useEffect } from "react";

const ParticleBackground = ({ particleCount = 1500 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let mouse = { x: -9999, y: -9999 };
    const mouseRadius = 250;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Color palette: deep blues, teals, greens
    const colors = [
      [30, 100, 170],   // deep blue
      [50, 140, 200],   // medium blue
      [70, 170, 220],   // sky blue
      [40, 160, 180],   // teal
      [60, 180, 170],   // aqua teal
      [80, 190, 160],   // teal-green
      [70, 180, 130],   // emerald
      [100, 200, 140],  // green
      [130, 210, 160],  // light green
      [45, 120, 190],   // royal blue
    ];

    // === Define flowing stream paths ===
    // Tight ribbons concentrated in center-bottom area
    const streams = [
      // Main thick ribbon — center
      {
        yCenter: 0.50, amplitude: 0.12, frequency: 1.2, phase: 0,
        thickness: 50, count: 0.18, speedMult: 1.0,
      },
      // Upper ribbon
      {
        yCenter: 0.38, amplitude: 0.10, frequency: 1.8, phase: Math.PI * 0.5,
        thickness: 35, count: 0.14, speedMult: 1.3,
      },
      // Lower thick ribbon
      {
        yCenter: 0.62, amplitude: 0.14, frequency: 0.9, phase: Math.PI * 1.2,
        thickness: 45, count: 0.18, speedMult: 0.8,
      },
      // Crossing thin ribbon
      {
        yCenter: 0.45, amplitude: 0.18, frequency: 2.0, phase: Math.PI * 0.8,
        thickness: 25, count: 0.12, speedMult: 1.5,
      },
      // Bottom ribbon
      {
        yCenter: 0.68, amplitude: 0.08, frequency: 1.5, phase: Math.PI * 1.8,
        thickness: 30, count: 0.10, speedMult: 0.9,
      },
      // Top thin wisp
      {
        yCenter: 0.32, amplitude: 0.06, frequency: 2.5, phase: Math.PI * 0.3,
        thickness: 20, count: 0.10, speedMult: 1.6,
      },
      // Middle interweaving strand
      {
        yCenter: 0.55, amplitude: 0.16, frequency: 1.4, phase: Math.PI * 1.5,
        thickness: 38, count: 0.13, speedMult: 1.1,
      },
    ];

    // Compute the Y position of a stream at a given X
    const getStreamY = (stream, x, time) => {
      const h = canvas.height;
      const w = canvas.width;
      return h * stream.yCenter +
        Math.sin((x / w) * Math.PI * stream.frequency + stream.phase + time * 0.0003) *
        h * stream.amplitude;
    };

    class Particle {
      constructor(stream) {
        this.stream = stream;
        this.reset();
      }

      reset() {
        const s = this.stream;
        // Position along the stream — span beyond screen edges
        this.t = Math.random() * (canvas.width + 200) - 100;
        this.homeY = getStreamY(s, this.t, 0);

        // Offset from stream center (within thickness)
        this.offsetY = (Math.random() - 0.5) * s.thickness;

        this.x = this.t;
        this.y = this.homeY + this.offsetY;

        // Displaced position (for mouse interaction)
        this.dx = 0;
        this.dy = 0;

        // Size — particles near center of stream are larger
        const distFromCenter = Math.abs(this.offsetY) / (s.thickness * 0.5);
        this.size = (1 - distFromCenter * 0.5) * (Math.random() * 1.5 + 0.3);

        // Speed
        this.speed = (Math.random() * 0.6 + 0.3) * s.speedMult;

        // Micro-wave for organic feel
        this.microAmp = Math.random() * 1.5 + 0.5;
        this.microFreq = Math.random() * 0.03 + 0.01;
        this.microPhase = Math.random() * Math.PI * 2;

        // Color
        const c = colors[Math.floor(Math.random() * colors.length)];
        const opacity = (1 - distFromCenter * 0.5) * (Math.random() * 0.4 + 0.4);
        this.color = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${opacity})`;

        this.life = Math.random() * 1000;
      }

      update(time) {
        this.life++;

        // Move along stream
        this.t += this.speed;
        if (this.t > canvas.width + 100) {
          this.t = -100;
          this.offsetY = (Math.random() - 0.5) * this.stream.thickness;
        }

        // Calculate home position on stream
        this.homeY = getStreamY(this.stream, this.t, time) + this.offsetY;
        const microWave = Math.sin(this.life * this.microFreq + this.microPhase) * this.microAmp;

        // Target position
        const targetX = this.t;
        const targetY = this.homeY + microWave;

        // Mouse repulsion
        const mx = targetX + this.dx - mouse.x;
        const my = targetY + this.dy - mouse.y;
        const dist = Math.sqrt(mx * mx + my * my);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(my, mx);
          this.dx += Math.cos(angle) * force * 12;
          this.dy += Math.sin(angle) * force * 12;
        }

        // Spring back to stream position
        this.dx *= 0.95;
        this.dy *= 0.95;

        this.x = targetX + this.dx;
        this.y = targetY + this.dy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Create particles distributed across streams
    const particles = [];
    streams.forEach((stream) => {
      const n = Math.floor(particleCount * stream.count);
      for (let i = 0; i < n; i++) {
        particles.push(new Particle(stream));
      }
    });

    // Add a small number of "dust" particles for atmosphere
    const dustCount = Math.floor(particleCount * 0.05);
    for (let i = 0; i < dustCount; i++) {
      const dustStream = {
        yCenter: Math.random(),
        amplitude: 0.02,
        frequency: 0.5,
        phase: Math.random() * Math.PI * 2,
        thickness: canvas.height * 0.3,
        count: 0,
        speedMult: 0.3 + Math.random() * 0.3,
      };
      particles.push(new Particle(dustStream));
    }

    let time = 0;

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticleBackground;
