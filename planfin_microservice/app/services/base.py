# app/services/base.py
from __future__ import annotations
from typing import Any, Dict, List, Union
import math
import logging

logger = logging.getLogger(__name__)
Number = float

class BaseService:
    """
    Clase base para todos los servicios de cálculo.

    Responsabilidades:
    - Mantener el payload original del request.
    - Proveer utilidades genéricas de acceso (_pick) y conversión (_to_float).
    - Ofrecer helpers de redondeo y de recorrido de estructuras si se quieren reutilizar.

    Cada servicio hijo puede:
    - Sobrescribir métodos si necesita reglas específicas.
    - Usar o ignorar los helpers según convenga.
    """

    # Claves que NO se deben redondear en _round_up_all por defecto.
    # Los servicios hijos pueden:
    # - Extender este set.
    # - Sobrescribir _round_up_all si necesitan lógica distinta.
    NO_ROUND_KEYS = {
        "ipcPct", "pibPct", "devaluacionPct", "tasaInteresPct",
        "preciosPct", "unidadesPct", "costosPct",
        "inctCostoVariablePorAno", "inctEgresosPorAno",
        "incrementoSalarios", "tasaInteresProyCred", "valorCuotaMes",
    }

    def __init__(self, payload: Dict[str, Any] | None = None) -> None:
        """
        payload: JSON completo del proyecto, o bien el resultado de otro servicio.
        """
        self.payload: Dict[str, Any] = payload or {}

    # ======================= Gestión de payload =======================

    def set_payload(self, payload: Dict[str, Any]) -> None:
        """Permite reutilizar la misma instancia con un nuevo payload si se requiere."""
        self.payload = payload or {}

    # ======================= Helpers genéricos =======================

    def _pick(self, root: Dict[str, Any], keys: List[str], default: Any = None) -> Any:
        """
        Navega un diccionario anidado usando una lista de claves.
        Si en algún punto la clave no existe, devuelve `default`.

        Ejemplo:
            self._pick(data, ["a", "b", "c"], 0)
        equivale a:
            data.get("a", {}).get("b", {}).get("c", 0)
        pero sin levantar excepciones.
        """
        cur: Any = root
        for k in keys:
            if not isinstance(cur, dict) or k not in cur:
                return default
            cur = cur[k]
        return cur

    def _to_float(self, x: Any) -> float:
        """
        Convierte cadenas tipo '1.234,56' o '1234.56' a float.
        Si falla, devuelve 0.0.
        """
        try:
            return float(str(x).replace(",", ""))
        except Exception:
            return 0.0

    def _round_up(self, val: Union[float, int]) -> int:
        """
        Redondea SIEMPRE hacia arriba al entero más cercano (ceil).
        Si no se puede convertir, devuelve val tal cual.
        """
        try:
            return int(math.ceil(float(val)))
        except Exception:
            return val

    def _round_up_all(self, obj: Any, parent_key: str = "") -> Any:
        """
        Recorre recursivamente dicts/listas y redondea hacia arriba todos los floats/ints,
        excepto cuando la clave pertenece a NO_ROUND_KEYS.

        Los servicios hijos pueden:
        - Añadir claves a NO_ROUND_KEYS
        - Sobrescribir este método si necesitan reglas distintas.
        """
        if isinstance(obj, dict):
            new_dict: Dict[str, Any] = {}
            for k, v in obj.items():
                if k in self.NO_ROUND_KEYS:
                    new_dict[k] = v
                else:
                    new_dict[k] = self._round_up_all(v, parent_key=k)
            return new_dict

        elif isinstance(obj, list):
            return [self._round_up_all(v, parent_key=parent_key) for v in obj]

        elif isinstance(obj, (float, int)):
            if parent_key in self.NO_ROUND_KEYS:
                return float(obj)
            return self._round_up(obj)

        else:
            return obj

    # ======================= Helpers vectoriales simples =======================

    def _ensure_len(self, arr: List[Number] | None, n: int, fill: float = 0.0) -> List[Number]:
        """
        Asegura que una lista tenga longitud n, rellenando con `fill` si es necesario.
        """
        arr = list(arr or [])
        if len(arr) < n:
            arr += [fill] * (n - len(arr))
        return arr[:n]

    def _vadd(self, a: List[Number], b: List[Number], n: int) -> List[Number]:
        """
        Suma elemento a elemento dos listas numéricas, de longitud n.
        """
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        return [a[i] + b[i] for i in range(n)]

    def _vsub(self, a: List[Number], b: List[Number], n: int) -> List[Number]:
        """
        Resta elemento a elemento dos listas numéricas, de longitud n: a - b.
        """
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        return [a[i] - b[i] for i in range(n)]

    def _vsub2(self, a: List[Number], b: List[Number], c: List[Number], n: int) -> List[Number]:
        """
        a - b - c, elemento a elemento.
        """
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        c = self._ensure_len(c, n)
        return [a[i] - b[i] - c[i] for i in range(n)]

    def _vsub4(
        self,
        a: List[Number],
        b: List[Number],
        c: List[Number],
        d: List[Number],
        n: int
    ) -> List[Number]:
        """
        a - b - c - d, elemento a elemento.
        """
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        c = self._ensure_len(c, n)
        d = self._ensure_len(d, n)
        return [a[i] - b[i] - c[i] - d[i] for i in range(n)]
