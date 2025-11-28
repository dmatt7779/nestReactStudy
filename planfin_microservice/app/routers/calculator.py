# app/routers/calculator.py
from fastapi import APIRouter, Body
from typing import Dict, Any, Optional

from app.services.calculator_service import CalculatorService
from app.services.estado_resultados import EstadoResultadosService
from app.services.informacion_inicial import InformacionInicialService  # 👈 nuevo import

router = APIRouter()


@router.post("/calculate/core")
def calculate_core(payload: Dict[str, Any] = Body(...)):
    """
    Orquesta todo:
    - Calcula informacionInicial
    - Adjunta planFinanciero
    """
    service = CalculatorService(payload)
    result = service.calculate()
    return {"ok": True, "result": result}


@router.post("/calculate/info_inicial")
def calculate_info_inicial(payload: Dict[str, Any] = Body(...)):
    """
    Endpoint “clásico” que solo corre InformacionInicialService.
    Útil para mantener compatibilidad con el front viejo.
    """
    svc = InformacionInicialService(payload)
    info_inicial = svc.calculate()
    return {"ok": True, "result": info_inicial}


@router.post("/calculate/estado-resultados")
def calculate_estado_resultados(
    info_inicial_result: Dict[str, Any] = Body(...),
    tasa_impuesto_pct: Optional[float] = Body(None),
):
    """
    Recibe el result de /calculate/core (o estructura equivalente)
    y genera:
      - estadoResultados
      - planAmortizacion
      - flujoEfectivo
      - esf
    """
    svc = EstadoResultadosService(
        info_inicial_result=info_inicial_result,
        tasa_impuesto_pct=tasa_impuesto_pct,
    )
    er = svc.calculate()
    return {"ok": True, "result": er}
