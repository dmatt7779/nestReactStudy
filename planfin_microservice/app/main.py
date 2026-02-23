# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers import calculator

app = FastAPI(title="Plan Financiero Microservice")
origins_regex = "https?://.*\.ceipa\.edu\.co"

# ---------- CORS: Políticas estrictas para Producción ----------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=origins_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

# ---------- Rutas principales ----------
@app.get("/")
async def root():
    return {
        "ok": True,
        "message": "Plan Financiero Microservice running",
    }

app.include_router(calculator.router, prefix="/api/v1")
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

