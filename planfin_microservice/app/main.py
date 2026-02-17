
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import calculator

app = FastAPI(title="Magic Excel Calculator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # acepta peticiones desde cualquier dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "ok": True,
        "message": "Magic Excel Calculator running",
    }

app.include_router(calculator.router, prefix="")

@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def catch_all(full_path: str, request: Request):
    try:
        body = await request.json()
    except Exception:
        body = None

    try:
        return body
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )

