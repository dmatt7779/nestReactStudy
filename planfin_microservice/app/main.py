# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
app.include_router(calculator.router, prefix="/api/v1")

# ---------- Manejo de rutas no encontradas ----------
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "message": exc.detail,
            "path": str(request.url.path),
            "method": request.method,
        },
    )

