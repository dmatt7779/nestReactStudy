# app/services/calculator_service.py
from typing import Dict, Any
from .base import BaseService
from .informacion_inicial import InformacionInicialService

class CalculatorService(BaseService):
    """
    Orquestador principal del microservicio.

    Recibe el payload crudo desde el frontend (el JSON completo del proyecto)
    y construye el bloque "informacionInicial" usando InformacionInicialService.

    El resultado de calculate() es el JSON que luego se usa como entrada
    para EstadoResultadosService en el endpoint /calculate/estado-resultados.
    """

    def __init__(self, payload: Dict[str, Any]):
        super().__init__(payload or {})

    def calculate(self) -> Dict[str, Any]:
        """
        1) Calcula informacionInicial (años, proyecciones, costos, activos, etc.)
        2) Adjunta planFinanciero original para que otros servicios (p.ej. EstadoResultadosService)
           puedan leer cosas como impuestosRenta, tmrr, gmf4xmil, etc.
        """
        # 1. Información inicial (toda la magia grande está en InformacionInicialService)
        info_svc = InformacionInicialService(self.payload)
        info_inicial = info_svc.calculate()

        # 2. Plan financiero original (se pasa tal cual para mantener contexto)
        plan_financiero = self.payload.get("planFinanciero", {}) or {}

        # 3. Resultado final que viaja al front y/o a EstadoResultadosService
        result: Dict[str, Any] = {
            "informacionInicial": info_inicial,
            "planFinanciero": plan_financiero,
        }

        # Si quisieras redondear algo más aquí, podrías usar self._round_up_all(result),
        # pero informacionInicial ya viene redondeado internamente.
        return result
