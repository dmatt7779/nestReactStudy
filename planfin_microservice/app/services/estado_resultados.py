# app/services/estado_resultados_service.py
import math
import logging
from typing import Any, Dict, List, Union
from .base import BaseService

logger = logging.getLogger(__name__)
Number = float

class EstadoResultadosService(BaseService):
    def __init__(self, info_inicial_result: Dict[str, Any], tasa_impuesto_pct: Number | None = None):
        self.data = info_inicial_result or {}

        # === Tasa de impuesto (impuestosRenta) ===
        # 1) Si viene por parámetro, usamos esa.
        raw_tasa = tasa_impuesto_pct

        # 2) Intentamos primero la ruta "nueva" del JSON:
        #    informacionInicial.otraInformacionFinanciera.financiacion.impuestosRenta
        if raw_tasa is None:
            raw_tasa = self._pick(
                self.data,
                ["informacionInicial", "otraInformacionFinanciera", "financiacion", "impuestosRenta"],
                default=None,
            )

        # 3) Fallback a la ruta vieja (planFinanciero.planFinanciero.impuestosRenta) si existiera
        if raw_tasa is None:
            raw_tasa = self._pick(
                self.data,
                ["planFinanciero", "planFinanciero", "impuestosRenta"],
                default=0.0,
            )

        tasa = self._to_float(raw_tasa)
        # Si la tasa viene como 33, la pasamos a 0.33
        if tasa > 1.0:
            tasa = tasa / 100.0

        self.tasa_impuesto = tasa

    # ======================= ORQUESTADOR =======================

    def calculate(self) -> Dict[str, Any]:
        years = self._extract_years()
        n = len(years)

        # 1) Estado de resultados base
        estado = self._build_estado_base(years)

        # 2) Amortización
        plan_amort = self._build_plan_amortizacion()

        # 3) Flujo efectivo (Op, Fin, Inv)
        flujo_op = self._build_flujo_operacion(n)
        flujo_fin = self._build_flujo_financiacion(n, years, plan_amort)
        flujo_inv = self._build_flujo_inversion(n)

        # 4) Gastos financieros (ER)
        estado["gastosFinancieros"] = self._build_gastos_financieros(years, plan_amort)

        # 5) Excedente, saldos (Excel)
        excedente = self._build_excedente(flujo_op, flujo_fin, flujo_inv, n)
        saldos = self._build_saldos(n, excedente)

        # --- inicioAno ---
        exc0 = excedente[0] if n > 0 and len(excedente) > 0 else 0
        sin0 = saldos["saldoInicial"][0] if n > 0 and saldos.get("saldoInicial") else 0
        sfin0 = saldos["saldoFinalEfectivo"][0] if n > 0 and saldos.get("saldoFinalEfectivo") else 0
        dj0 = saldos["decisionJuntaAporteSocios"][0] if n > 0 and saldos.get("decisionJuntaAporteSocios") else 0

        inicio_ano = {
            "excedenteODeficitEfectivoAnoInicio": exc0,
            "saldoInicialAnoInicio": sin0,
            "saldoFinalEfectivoAnoInicio": sfin0,
            "decisionJuntaAporteSociosAnoInicio": dj0,
        }

        # 6) Estado Situacion Financiera (ESF)
        esf = self._build_esf(saldos)

        return {
            "estadoResultados": estado,
            "planAmortizacion": plan_amort,
            "flujoEfectivo": {
                "actividadOperacion": flujo_op,
                "actividadFinanciacion": flujo_fin,
                "actividadInversion": flujo_inv,
                "inicioAno": inicio_ano,
                "excedenteODeficitEfectivo": excedente,
                "decisionJuntaAporteSocios": saldos["decisionJuntaAporteSocios"],
                "saldoInicial": saldos["saldoInicial"],
                "saldoFinalEfectivo": saldos["saldoFinalEfectivo"],
            },
            "esf": esf,
        }

    # ======================= BLOQUE 1: ESTADO BASE =======================

    def _build_estado_base(self, years: List[int]) -> Dict[str, Any]:
        n = len(years)

        ingresos = self._pick(self.data, [
            "informacionInicial", "informacionPlanMercadeo", "productos", "totalIngresosProyectados"
        ], default=[0.0] * n)

        cv = self._pick(self.data, [
            "informacionInicial", "informacionPlanOperativo", "costosVariables", "totalCostosVariables"
        ], default=[0.0] * n)

        cf_block = self._pick(
            self.data,
            ["informacionInicial", "informacionPlanOperativo", "costosFijos"],
            default={},
        ) or {}
        total_cf_6 = cf_block.get("totalCostosFijos", []) or []

        # CF en Excel tiene 6 posiciones: [mensual, año1, año2, ..., año5]
        cf_alineado = [
            self._to_float(total_cf_6[i + 1]) if len(total_cf_6) > (i + 1) else 0.0
            for i in range(n)
        ]

        costo_ventas = self._vadd(cv, cf_alineado, n)
        utilidad_bruta = self._vsub(ingresos, costo_ventas, n)
        utilidad_antes_imp_int = self._build_utilidad_antes_imp_int(utilidad_bruta)

        # ========== IMPUESTOS (fila C21..G21) ==========
        impuestos: List[int] = []
        tasa = self.tasa_impuesto

        for i in range(n):
            u = self._to_float(utilidad_antes_imp_int[i]) if i < len(utilidad_antes_imp_int) else 0.0
            if u > 0 and tasa > 0:
                impuestos.append(self._to_int(u * tasa))
            else:
                impuestos.append(0)

        return {
            "years": years,
            "ingresos": [self._to_int(x) for x in self._ensure_len(ingresos, n)],
            "costoVentas": costo_ventas,
            "utilidadBruta": utilidad_bruta,
            "gastosOperativosTotales": [
                self._to_int(x) for x in (cf_block.get("totalGastosOperativos", [0] * n) or [0] * n)
            ],
            "utilidadAntesImpInt": utilidad_antes_imp_int,
            "impuestos": impuestos,
        }

    def _build_utilidad_antes_imp_int(self, utilidad_bruta: List[float]) -> List[int]:
        cf_block = self._pick(
            self.data,
            ["informacionInicial", "informacionPlanOperativo", "costosFijos"],
            default={},
        ) or {}
        gastos_operativos = cf_block.get("totalGastosOperativos", []) or []
        n = min(len(utilidad_bruta), len(gastos_operativos))
        return [
            self._to_int(self._to_float(utilidad_bruta[i]) - self._to_float(gastos_operativos[i]))
            for i in range(n)
        ]

    # ======================= BLOQUE 2: PLAN AMORTIZACIÓN =======================

    def _build_plan_amortizacion(self) -> Dict[str, Any]:
        fin = self._pick(
            self.data,
            ["informacionInicial", "otraInformacionFinanciera", "financiacion"],
            default={},
        ) or {}

        valor_prestamo = self._to_int(fin.get("creditoTerceros", 0))
        plazo_credito = int(self._to_float(fin.get("plazoCredito", 0)))
        tasa_interes = float(self._to_float(fin.get("tasaInteresProyCred", 0.0)))
        cuota_mes_in = self._to_float(fin.get("valorCuotaMes", 0.0))

        cuota_mes = self._calc_pmt_if_needed(valor_prestamo, tasa_interes, plazo_credito, cuota_mes_in)
        plan_pagos = self._build_plan_pagos(valor_prestamo, tasa_interes, plazo_credito, cuota_mes)
        totales_ano = self._totales_por_ano_desde_plan_pagos(plan_pagos, plazo_credito)

        return {
            "valorPrestamo": self._to_int(valor_prestamo),
            "plazoCredito": int(plazo_credito),
            "tasaInteres": tasa_interes,
            "cuotaMes": self._to_int(cuota_mes),
            "planPagos": plan_pagos,
            "totalCapitalAno": totales_ano,
        }

    def _calc_pmt_if_needed(self, principal: int, rate: float, nper: int, cuota_mes_in: float) -> float:
        if cuota_mes_in > 0:
            return cuota_mes_in
        if nper <= 0 or principal <= 0:
            return 0.0
        if abs(rate) < 1e-12:
            return principal / float(nper)
        return principal * rate / (1.0 - (1.0 + rate) ** (-nper))

    def _build_plan_pagos(self, principal: int, rate: float, nper: int, cuota_mes: float) -> List[Dict[str, int]]:
        pagos: List[Dict[str, int]] = []
        saldo = float(principal)
        r = float(rate)
        cuota = float(cuota_mes)

        for k in range(1, max(0, nper) + 1):
            inicial_k = saldo
            if inicial_k <= 0:
                interes_k = 0.0
                capital_k = 0.0
                saldo_k = 0.0
            else:
                interes_k = inicial_k * r
                pago_capital = max(0.0, cuota - interes_k)
                capital_k = min(inicial_k, pago_capital)
                saldo_k = max(0.0, inicial_k - capital_k)

            pagos.append({
                "cuota": k,
                "inicial": self._to_int(inicial_k),
                "interes": self._to_int(interes_k),
                "capital": self._to_int(capital_k),
                "saldo": self._to_int(saldo_k),
            })
            saldo = saldo_k

        return pagos

    def _totales_por_ano_desde_plan_pagos(
        self, plan_pagos: List[Dict[str, int]], plazo_meses: int
    ) -> List[Dict[str, int]]:
        out: List[Dict[str, int]] = []
        ano = 1
        for start in range(0, plazo_meses, 12):
            end = min(start + 12, plazo_meses)
            tramo = plan_pagos[start:end]
            total_interes = self._to_int(sum(self._to_float(x.get("interes", 0)) for x in tramo))
            total_capital = self._to_int(sum(self._to_float(x.get("capital", 0)) for x in tramo))
            out.append({
                "ano": ano,
                "totalInteresesAno": total_interes,
                "totalCapitalAno": total_capital,
            })
            ano += 1
        return out

    def _build_gastos_financieros(self, years: List[int], plan_amort: Dict[str, Any]) -> List[int]:
        n = len(years)
        tca = (plan_amort or {}).get("totalCapitalAno", []) or []
        vals = [self._to_int((t or {}).get("totalInteresesAno", 0)) for t in tca]
        if len(vals) < n:
            vals += [0] * (n - len(vals))
        return vals[:n]

    # ======================= BLOQUE 3: FLUJO DE EFECTIVO =======================

    def _build_flujo_operacion(self, n: int) -> Dict[str, Any]:
        fin = self._pick(
            self.data,
            ["informacionInicial", "otraInformacionFinanciera", "financiacion"],
            default={},
        ) or {}
        cf_block = self._get_cf_block()

        ventas_contado = [self._to_int(x) for x in (fin.get("ventasContado", []) or [])]
        cuentas_cobrar = [self._to_int(x) for x in (fin.get("cuentasCobrar", []) or [])][:-1]
        gastos_operativos = [-self._to_int(x) for x in (cf_block.get("totalGastosOperativos", []) or [])]
        proveedores = [-self._to_int(x) for x in (fin.get("proveedores", []) or [])][:-1]

        inv_inv_ini = -self._to_int(
            self._pick(
                self.data,
                ["informacionInicial", "otraInformacionFinanciera", "capitalDeTrabajo", "diasExistInventario"],
                0,
            )
        )

        dep = [self._to_int(x) for x in (cf_block.get("gastosPorDepreciacion", []) or [])]
        amort = [self._to_int(x) for x in (cf_block.get("gastoPorAmortizacion", []) or [])]
        m = min(len(dep), len(amort), n)
        depreciacion_amortizacion = [self._to_int(dep[i] + amort[i]) for i in range(m)]
        if len(depreciacion_amortizacion) < n:
            depreciacion_amortizacion += [0] * (n - len(depreciacion_amortizacion))

        costos_operativos = self._calc_costos_operativos_por_ano(n)

        return {
            "ventasContado": self._ensure_len(ventas_contado, n),
            "recuperacionCartera": self._ensure_len(cuentas_cobrar, n - 1),  # n-1
            "costosOperativos": costos_operativos,
            "gastosOperativos": self._ensure_len(gastos_operativos, n),
            "pagoProveedores": self._ensure_len(proveedores, n - 1),        # n-1
            "inversionInventarioInicial": inv_inv_ini,
            "depreciacionAmortizacion": self._ensure_len(depreciacion_amortizacion, n),
        }

    def _calc_costos_operativos_por_ano(self, n: int) -> List[int]:
        cf_block = self._get_cf_block()
        fin = self._pick(
            self.data,
            ["informacionInicial", "otraInformacionFinanciera", "financiacion"],
            default={},
        ) or {}

        total_cf_6 = (cf_block.get("totalCostosFijos", []) or [])
        CF = [self._to_int(total_cf_6[i + 1]) if len(total_cf_6) > (i + 1) else 0 for i in range(n)]

        CV = [self._to_int(x) for x in (
            self._pick(
                self.data,
                ["informacionInicial", "informacionPlanOperativo", "costosVariables", "totalCostosVariables"],
                [],
            ) or []
        )]
        Inv = [self._to_int(x) for x in (fin.get("inventarioMercancia", []) or [])]
        Prov = [self._to_int(x) for x in (fin.get("proveedores", []) or [])]

        InvInicial = self._to_int(
            self._pick(
                self.data,
                ["informacionInicial", "otraInformacionFinanciera", "capitalDeTrabajo", "diasExistInventario"],
                0,
            )
        )

        out: List[int] = []
        for t in range(n):
            CF_t = CF[t] if t < len(CF) else 0
            CV_t = CV[t] if t < len(CV) else 0
            Prov_t = Prov[t] if t < len(Prov) else 0
            Inv_t = Inv[t] if t < len(Inv) else 0

            if t == 0:
                val = -(CF_t + CV_t - InvInicial - Prov_t + Inv_t)
            else:
                Inv_tm1 = Inv[t - 1] if (t - 1) < len(Inv) else 0
                val = -(CF_t + CV_t - Prov_t - Inv_tm1 + Inv_t)

            out.append(self._to_int(val))

        return out

    def _build_flujo_financiacion(self, n: int, years: List[int], plan_amort: Dict[str, Any]) -> Dict[str, int]:
        capital_socios = self._to_int(
            self._pick(
                self.data,
                ["informacionInicial", "otraInformacionFinanciera", "financiacion", "financiacionPropia"],
                0,
            )
        )
        prestamo = self._to_int(
            self._pick(
                self.data,
                ["informacionInicial", "otraInformacionFinanciera", "financiacion", "creditoTerceros"],
                0,
            )
        )
        total_capital_ano = plan_amort.get("totalCapitalAno", []) or []
        servicio_deuda = [0] * n
        for i in range(min(n, len(total_capital_ano))):
            total_cap = total_capital_ano[i].get("totalCapitalAno", total_capital_ano[i].get("totalCapital", 0))
            servicio_deuda[i] = -self._to_int(total_cap)

        intereses = self._build_gastos_financieros(years, plan_amort)
        intereses = [-self._to_int(val) for val in intereses]

        return {
            "capitalInicialSocios": capital_socios,
            "adquisicionPrestamos": prestamo,
            "servicioDeuda": servicio_deuda,
            "intereses": intereses,
        }

    # ======================= INVERSIÓN =======================

    def _build_flujo_inversion(self, n: int) -> Dict[str, Any]:
        """
        Excel:
        C..H299  ->  Inicio, 2025, 2026, 2027, 2028, 2029  (6 posiciones)
        inversionActivosFijos = [ -(C299), -(D299), ...(H299) ]
        """
        af = self._pick(
            self.data,
            ["informacionInicial", "informacionPlanOperativo", "activosFijos"],
            default={},
        ) or {}

        serie = af.get("totalInversionActivosFijosPorAnoExcel")
        if not isinstance(serie, list) or len(serie) == 0:
            serie = af.get("totalInversionActivosFijosPorAno", [])

        serie6 = list(serie[:6]) + [0] * max(0, 6 - len(serie))

        inversion_activos_6 = [-self._to_int(x) for x in serie6]

        venta_unica = self._calc_venta_activos_fijos_unica()

        return {
            "ventaActivosFijos": venta_unica,
            "inversionActivosFijos": inversion_activos_6,
        }

    # ======================= EXCEDENTE / SALDOS =======================

    def _sum_vector(self, *series: List[int], n: int) -> List[int]:
        acc = [0] * n
        for s in series:
            s2 = self._ensure_len(s or [], n)
            acc = [self._to_int(self._to_float(acc[i]) + self._to_float(s2[i])) for i in range(n)]
        return acc

    def _build_excedente(self, op: Dict[str, Any], fin: Dict[str, Any], inv: Dict[str, Any], n: int) -> List[int]:
        """
        EXC[0] ≈ inversionInventarioInicial + capitalInicialSocios + adquisicionPrestamos + inversionActivosFijos[0]
        EXC[1] = combinación manual de componentes (de momento simplificada).
        EXC[2..] = 0 (hasta afinar fórmulas completas).
        """

        ventas = self._ensure_len(op.get("ventasContado", []), n)
        coper = self._ensure_len(op.get("costosOperativos", []), n)
        goper = self._ensure_len(op.get("gastosOperativos", []), n)
        deprec = self._ensure_len(op.get("depreciacionAmortizacion", []), n)

        cap_soc = self._to_int(fin.get("capitalInicialSocios", 0) or 0)
        prest = self._to_int(fin.get("adquisicionPrestamos", 0) or 0)
        sdeuda = self._ensure_len(fin.get("servicioDeuda", []), n)
        inter = self._ensure_len(fin.get("intereses", []), n)

        inv_inv_ini = self._to_int(op.get("inversionInventarioInicial", 0) or 0)
        inv_af_6 = inv.get("inversionActivosFijos", []) or []
        inv_af_inicio = self._to_int(inv_af_6[0]) if len(inv_af_6) > 0 else 0

        exc = [0] * n

        # EXC[0]
        exc[0] = self._to_int(inv_inv_ini + cap_soc + prest + inv_af_inicio)

        # EXC[1] (aún simplificado)
        if n > 1:
            inv_af_1 = self._to_int(inv_af_6[1]) if len(inv_af_6) > 1 else 0
            ventas_0 = self._to_int(ventas[0])
            coper_0 = self._to_int(coper[0])
            goper_0 = self._to_int(goper[0])
            deprec_0 = self._to_int(deprec[0])
            sdeuda_0 = self._to_int(sdeuda[0]) if len(sdeuda) > 0 else 0
            inter_0 = self._to_int(inter[0]) if len(inter) > 0 else 0

            exc[1] = self._to_int(
                inv_af_1
                + inter_0
                + sdeuda_0
                + deprec_0
                + goper_0
                + coper_0
                + ventas_0
            )

        for t in range(2, n):
            exc[t] = 0

        return exc

    def _get_saldo_inicial_base(self) -> int:
        """
        Método original para saldo inicial a partir de capitalTrabajoInicio (no se usa ahora).
        Lo mantenemos por si lo necesitas luego.
        """
        cdt = self._pick(
            self.data,
            ["informacionInicial", "otraInformacionFinanciera", "capitalDeTrabajo"],
            default={},
        ) or {}
        return self._to_int(cdt.get("capitalTrabajoInicio", 0))

    def _build_decision_junta_excel(self, saldo_inicial: List[int], excedente: List[int]) -> List[int]:
        """
        Excel (Decisión Junta Directiva (Aporte Socios)):
        =SI(SINI+EXC<0, SINI+EXC, 0)
        """
        n = len(excedente)
        out = [0] * n
        for t in range(n):
            s = self._to_float(saldo_inicial[t]) + self._to_float(excedente[t])
            out[t] = self._to_int(s) if s < 0 else 0
        return out

    def _build_saldos(self, n: int, excedente: List[int]) -> Dict[str, List[int]]:
        """
        SALDO FINAL(t) = SALDO INICIAL(t) + EXCEDENTE(t) - DECISION_JUNTA(t)
        con DECISION_JUNTA(t) ≤ 0 (exacto a Excel).
        SALDO INICIAL(0) = 0 (D42).
        SALDO INICIAL(t>0) = SALDO FINAL(t-1).
        """
        saldo_inicial = [0] * n
        saldo_inicial[0] = 0  # Excel: D42 = 0

        decision = [0] * n
        saldo_final = [0] * n

        # t = 0
        decision[0] = self._build_decision_junta_excel([saldo_inicial[0]], [excedente[0]])[0]
        saldo_final[0] = self._to_int(
            self._to_float(saldo_inicial[0]) +
            self._to_float(excedente[0]) -
            self._to_float(decision[0])
        )

        # t >= 1
        for t in range(1, n):
            saldo_inicial[t] = saldo_final[t - 1]
            decision[t] = self._build_decision_junta_excel([saldo_inicial[t]], [excedente[t]])[0]
            saldo_final[t] = self._to_int(
                self._to_float(saldo_inicial[t]) +
                self._to_float(excedente[t]) -
                self._to_float(decision[t])
            )

        return {
            "saldoInicial": saldo_inicial,
            "decisionJuntaAporteSocios": decision,
            "saldoFinalEfectivo": saldo_final,
        }

    def _read_payout_series(self, n: int) -> List[float]:
        """
        % de dividendos por año (0..1).
        """
        pf = self._pick(self.data, ["planFinanciero", "planFinanciero"], default={}) or {}
        arr = pf.get("payoutDividendosPctPorAno")
        if isinstance(arr, list) and arr:
            return [float(self._to_float(x)) / 100.0 for x in self._ensure_len(arr, n)]
        scalar = pf.get("payoutDividendosPct")
        if scalar is not None:
            return [float(self._to_float(scalar)) / 100.0] * n
        return [0.0] * n

    # ======================= ESTADO SITUACION FINANCIERA =======================

    def _build_esf(self, saldos: Dict[str, List[int]]) -> Dict[str, Any]:
        """
        esf.activosCorrientes.disponible:
        - index 0: flujoEfectivo.saldoInicial[1]  (primer año "real")
        - index 1..5: saldoMinCaja (repetido)
        """
        saldo_inicial = saldos.get("saldoInicial", []) or []
        disponible_0 = self._to_int(saldo_inicial[1]) if len(saldo_inicial) > 1 else 0

        raw_saldo_min = self._pick(
            self.data,
            ["informacionInicial", "otraInformacionFinanciera", "financiacion", "saldoMinCaja"],
            0,
        )
        saldo_min_caja = self._to_int(raw_saldo_min)

        disponible: List[int] = [disponible_0]
        for _ in range(5):
            disponible.append(saldo_min_caja)

        logger.debug("ESF - disponibles: %s", disponible)

        return {
            "activosCorrientes": {
                "disponible": disponible
            }
        }

    # ======================= HELPERS =======================

    def _extract_years(self) -> List[int]:
        years = self._pick(self.data, ["informacionInicial", "years"], default=[]) or []
        return list(years)

    def _pick(self, root: Dict[str, Any], keys: List[str], default=None):
        cur = root
        for k in keys:
            if not isinstance(cur, dict) or k not in cur:
                return default
            cur = cur[k]
        return cur

    def _ensure_len(self, arr: Union[List[Number], None], n: int) -> List[Number]:
        arr = list(arr or [])
        if len(arr) < n:
            arr += [0.0] * (n - len(arr))
        return arr[:n]

    def _vadd(self, a: List[Number], b: List[Number], n: int) -> List[int]:
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        return [self._to_int(self._to_float(a[i]) + self._to_float(b[i])) for i in range(n)]

    def _vsub(self, a: List[Number], b: List[Number], n: int) -> List[int]:
        a = self._ensure_len(a, n)
        b = self._ensure_len(b, n)
        return [self._to_int(self._to_float(a[i]) - self._to_float(b[i])) for i in range(n)]

    def _to_float(self, x: Any) -> float:
        try:
            return float(str(x).replace(",", ""))
        except Exception:
            return 0.0

    def _to_int(self, val: Any) -> int:
        try:
            return int(math.ceil(float(val)))
        except Exception:
            return 0

    def _get_cv_series(self, n: int) -> List[int]:
        arr = self._pick(
            self.data,
            [
                "informacionInicial",
                "informacionPlanOperativo",
                "costosVariables",
                "totalCostosVariables",
            ],
            default=[0.0] * n,
        )
        arr = self._ensure_len(arr, n)
        return [self._to_int(x) for x in arr]

    def _get_cf_block(self) -> Dict[str, Any]:
        return self._pick(
            self.data,
            ["informacionInicial", "informacionPlanOperativo", "costosFijos"],
            default={},
        ) or {}

    def _calc_venta_activos_fijos_unica(self) -> int:
        """
        Excel: SUMA( max(0, C - 5*F) ) por rubro de activos fijos.
        """
        af = self._pick(
            self.data,
            ["informacionInicial", "informacionPlanOperativo", "activosFijos"],
            default={},
        ) or {}

        total = 0.0
        for key in [
            "mueblesEnseres",
            "maquinariaEquipos",
            "vehiculos",
            "terrenos",
            "edificaciones",
            "equiposComputo",
            "activosDiferidos",
        ]:
            blk = af.get(key)
            if not isinstance(blk, dict):
                continue
            val_total = self._to_float(blk.get("valorTotalActivoFijo", 0))
            dep_anual = self._to_float(blk.get("depAnual", 0))
            contrib = val_total - 5.0 * dep_anual
            if contrib > 0:
                total += contrib
        return self._to_int(total)

    def _scalar_en_ultimo_ano(self, val: int, n: int) -> List[int]:
        if n <= 0:
            return []
        vec = [0] * n
        vec[-1] = self._to_int(val)
        return vec
