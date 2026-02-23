
from fastapi import APIRouter, Body
from typing import Dict, Any, Optional

from app.services.estado_resultados import EstadoResultadosService
from app.services.informacion_inicial import InformacionInicialService
from app.services.excel_engine import ExcelEngineService

router = APIRouter()

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
    Recibe el result de /calculate/info_inicial (o estructura equivalente)
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


@router.post("/calculate/excel")
def calculate_via_excel(payload: Dict[str, Any] = Body(...)):
    """
    - Escribe el payload en la hoja 'Instrucciones' de una copia de la plantilla.
    - Llama a LibreOffice headless para recalcular las fórmulas.
    - Lee algunas celdas de otras hojas y devuelve un JSON.
    """
    svc = ExcelEngineService(payload)
    result = svc.run()
    return {"result": result}
