# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routers import calculator  # importa tu router existente

app = FastAPI(title="Plan Financiero Microservice")

# ---------- CORS: aceptar cualquier origen (*) ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # acepta peticiones desde cualquier dominio
    allow_credentials=True,
    allow_methods=["*"],        # permite todos los métodos: GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],        # permite todos los headers
)

# ---------- Rutas principales ----------
@app.get("/")
async def root():
    return {
        "ok": True,
        "message": "Plan Financiero Microservice running",
    }

# Incluimos tu router de cálculos (core + estado_resultados)
app.include_router(calculator.router, prefix="")

# (Opcional) catch-all para debug / inspección rápida de requests
# OJO: si esto te molesta o choca con otras rutas, lo puedes borrar.
@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def catch_all(full_path: str, request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        body = None

    return {
        "ok": False,
        "message": "Ruta no encontrada, pero la app está corriendo 👍",
        "path": full_path,
        "method": request.method,
        "body": body,
    }
