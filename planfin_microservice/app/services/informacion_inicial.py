
from typing import Dict, Any, List, Union
from .base import BaseService
import math

class InformacionInicialService(BaseService):
    DEFAULT_HORIZON = 5

    def calculate(self) -> Dict[str, Any]:
        pj = self.payload

        start_year = int(pj["projectInfo"]["openingYear"])
        years = [start_year + i for i in range(self.DEFAULT_HORIZON)]

        macro = pj["proyeccionMacro"]["proyeccionesMacroeconomicas"]
        analisis = pj["proyeccionMacro"]["analisisMercado"]
        productos = pj["proyeccionMacro"]["producto"]
        planfin = pj["planFinanciero"]["planFinanciero"]
        costos_gastos = pj["costosGastos"]
        activos_blob = pj.get("activosFijos", {}).get("activosFijos", {})
        salarios_blob = pj.get("salarioAdmins", {}).get("salarioAdmins", {})
        estrategia_mkt = pj["proyeccionMacro"].get("estrategiaMarketing", [])

        # ---------- Growths ----------
        g_precios = self._resolve_growth(analisis.get("crecimientoPrecios", {}), macro, self.DEFAULT_HORIZON)
        g_unidades = self._resolve_growth(analisis.get("crecimientoUnidades", {}), macro, self.DEFAULT_HORIZON)
        g_costos = self._resolve_growth(analisis.get("crecimientoCostos", {}), macro, self.DEFAULT_HORIZON)
        ipc_series = self._ensure_len([self._to_float(x) for x in macro.get("ipc", [])], self.DEFAULT_HORIZON)
        pib_series = self._ensure_len([self._to_float(x) for x in macro.get("pib", [])], self.DEFAULT_HORIZON)

        growth_block = {
            "preciosPct": g_precios,
            "unidadesPct": g_unidades,
            "costosPct": g_costos,
            "ipcPct": ipc_series,
            "pibPct": pib_series,
        }

        # ---------- Productos + Marketing ----------
        prods = self._project_products(productos, g_precios, g_unidades, g_costos)
        marketing_block = self._project_marketing(estrategia_mkt, self.DEFAULT_HORIZON)

        # ---------- Costos variables ----------
        costos_variables_block = self._project_costos_variables(
            productos=productos,
            growth=growth_block,
            g_unidades=g_unidades
        )

        # ---------- Activos fijos ----------
        activos_fijos_block = self._project_activos_fijos(
            activos_blob=activos_blob,
            total_ingresos_proyectados=prods.get("totalIngresosProyectados", []),
            tarfia_ind_ccio_pct=planfin.get("tarfiaIndCcio", 0),
        )

        # ---------- Costos fijos ----------
        n = self.DEFAULT_HORIZON
        costos_fijos_block = self._project_costos_fijos(
            costos_gastos=costos_gastos,
            growth=growth_block,
            n=n,
            dep_series=activos_fijos_block.get("totalDepreciacionPorAno", [0.0] * n),
            amort_series=activos_fijos_block.get("totalAmortizacion", [0.0] * n),
            imp_ind_ccio=activos_fijos_block.get("impIndCcio", [0.0] * n),
            publicidad_series=marketing_block.get("totalCostosEstrategiasPorAno", [0.0] * n),
            gmf4xmil_pct=planfin.get("gmf4xmil", 0),
            costos_variables_block=costos_variables_block,
        )

        # ---------- Plan administrativo ----------
        plan_admin_block = self._project_plan_administrativo(
            salarios_blob=salarios_blob,
            growth=growth_block,
            n=self.DEFAULT_HORIZON
        )

        salarios_block = self._project_plan_admin_salarios(
            incremento_salarios=plan_admin_block.get("incrementoSalarios", []),
            n=self.DEFAULT_HORIZON
        )

        # ---------- Total gastos operativos ----------
        n = self.DEFAULT_HORIZON
        sub_total_gastos_operativos = (costos_fijos_block.get("subtotalGastosOperativos") or [0.0] * (n + 1))
        sub_total_gastos_operativos = sub_total_gastos_operativos[1:n + 1]

        dep_series = costos_fijos_block.get("gastosPorDepreciacion", [0.0] * n)
        amort_series = costos_fijos_block.get("gastoPorAmortizacion", [0.0] * n)
        impuestos_series = costos_fijos_block.get("gastoPorImpuestos", [0.0] * n)
        publicidad_series = costos_fijos_block.get("gastoPublicidad", [0.0] * n)
        nomina_series = salarios_block.get("totalNominaPorAno", [0.0] * n)

        costos_fijos_block["totalGastosOperativos"] = self._sum_series_same_len(
            sub_total_gastos_operativos,
            dep_series,
            amort_series,
            impuestos_series,
            publicidad_series,
            nomina_series
        )

        # ---------- Otra información financiera ----------
        otra_info_block = self._project_otra_informacion_financiera(
            planfin=planfin,
            costos_fijos_block=costos_fijos_block,
            total_ingresos_proyectados=prods.get("totalIngresosProyectados", []),
            activos_fijos_block=activos_fijos_block,
            costos_variables_block=costos_variables_block,
        )

        result = {
            "years": years,
            "tasaIva": float(analisis.get("tasaIva", 0)) / 100.0,
            "growth": growth_block,
            "informacionPlanMercadeo": {
                "productos": prods,
                "estrategiaMarketing": marketing_block,
            },
            "informacionPlanOperativo": {
                "costosVariables": costos_variables_block,
                "costosFijos": costos_fijos_block,
                "activosFijos": activos_fijos_block,
            },
            "planAdministrativo": {
                **plan_admin_block,
                "salarios": salarios_block,
            },
            "otraInformacionFinanciera": {
                **otra_info_block
            },
        }

        return self._round_up_all(result)

    # ======================= Helpers de crecimiento =======================

    def _resolve_growth(self, cfg: Dict[str, Any], macro: Dict[str, Any], n: int) -> List[float]:
        """
        Devuelve una serie % de longitud n según prioridad:
        1) estrategia.crecimientoCantidades
        2) ipc
        3) pib
        Si ninguna, devuelve ceros.
        """
        estrategia = bool(cfg.get("estrategia"))
        use_ipc = bool(cfg.get("ipc"))
        use_pib = bool(cfg.get("pib"))

        if estrategia:
            arr = [self._to_float(x) for x in cfg.get("crecimientoCantidades", [])]
            return self._ensure_len(arr, n, fill=0.0)
        if use_ipc:
            arr = [self._to_float(x) for x in macro.get("ipc", [])]
            return self._ensure_len(arr, n, fill=0.0)
        if use_pib:
            arr = [self._to_float(x) for x in macro.get("pib", [])]
            return self._ensure_len(arr, n, fill=0.0)
        return [0.0] * n

    def _ensure_len(self, arr: List[float], n: int, fill: float = 0.0) -> List[float]:
        out = list(arr[:n])
        while len(out) < n:
            out.append(fill)
        return out

    def _apply_growth(self, base: float, growth_pct: List[float]) -> List[float]:
        """
        Aplica crecimiento año a año (acumulativo):
        val_t = base * Π_{i<=t} (1 + g[i]/100)
        """
        vals = []
        acc = base
        for g in growth_pct:
            acc = acc * (1.0 + g / 100.0)
            vals.append(acc)
        return vals

    def _pct_to_factors(self, pct_series: List[float], n: int) -> List[float]:
        """
        Convierte una serie porcentual a factores multiplicativos NO acumulativos.
        factor[t] = 1 + pct[t]/100
        """
        series = self._ensure_len([self._to_float(x) for x in pct_series], n, fill=0.0)
        return [1.0 + (p / 100.0) for p in series]

    def _build_inct_costo_vble_pct_from_growth(
        self,
        analisis_costos: Dict[str, Any],
        growth: Dict[str, List[float]],
        n: int
    ) -> List[float]:
        """
        Devuelve la serie porcentual de FACTOR INCR. COSTO VBLE:
        pct[0] = 0
        pct[t] = según selector en analisis_costos:
                - estrategia=true  -> crecimientoCostos.crecimientoCantidades
                - ipc=true         -> growth['ipcPct']
                - pib=true         -> growth['pibPct']
                - ninguno          -> 0
        """
        estrategia = bool((analisis_costos or {}).get("estrategia"))
        use_ipc = bool((analisis_costos or {}).get("ipc"))
        use_pib = bool((analisis_costos or {}).get("pib"))

        if estrategia:
            src = [self._to_float(x) for x in (analisis_costos or {}).get("crecimientoCantidades", [])]
        elif use_ipc:
            src = [self._to_float(x) for x in (growth or {}).get("ipcPct", [])]
        elif use_pib:
            src = [self._to_float(x) for x in (growth or {}).get("pibPct", [])]
        else:
            src = [0.0] * n

        series = self._ensure_len(src, n, fill=0.0)
        if n > 0:
            series[0] = 0.0
        return series

    def _build_inct_egresos_pct_from_growth(
        self,
        inc_cfg: Dict[str, Any],
        growth: Dict[str, List[float]],
        n: int
    ) -> List[float]:
        """
        FACTOR INCR. EGRESOS (porcentual):
        pct[0] = 0
        pct[t] = según selector en costosGastos.incrementoEgresos:
                - estrategia=true  -> inc_cfg.incrementoEgresosCantidades
                - ipc=true         -> growth['ipcPct']
                - (pib NO aplica aquí)
                - ninguno          -> 0
        """
        estrategia = bool((inc_cfg or {}).get("estrategia"))
        use_ipc = bool((inc_cfg or {}).get("ipc"))

        if estrategia:
            src = [self._to_float(x) for x in (inc_cfg or {}).get("incrementoEgresosCantidades", [])]
        elif use_ipc:
            src = [self._to_float(x) for x in (growth or {}).get("ipcPct", [])]
        else:
            src = [0.0] * n

        series = self._ensure_len(src, n, fill=0.0)
        if n > 0:
            series[0] = 0.0
        return series

    def _to_series(self, v, n: int) -> List[float]:
        if isinstance(v, list):
            arr = [self._to_float(x) for x in v]
            return self._ensure_len(arr, n, fill=0.0)
        return [self._to_float(v)] * n

    def _fv(self, rate: float, nper: int, pmt: float, pv: float, when: int = 0) -> float:
        """
        Future Value (Excel VF):
        FV = -( pv*(1+r)^n + pmt*(1+r*when) * ((1+r)^n - 1)/r )
        Maneja r=0 y el signo de Excel (pv negativo -> FV positivo).
        """
        r = float(rate)
        n = int(nper)
        if n <= 0:
            return -pv
        if abs(r) < 1e-12:
            return -(pv + pmt * n)
        f = (1.0 + r) ** n
        return -(pv * f + pmt * (1.0 + r * when) * (f - 1.0) / r)

    def _sum_series_same_len(self, *series_lists: List[float]) -> List[float]:
        if not series_lists:
            return []
        n = max(len(s or []) for s in series_lists)
        out = [0.0] * n
        for s in series_lists:
            ss = self._ensure_len([self._to_float(x) for x in (s or [])], n, 0.0)
            for i in range(n):
                out[i] += ss[i]
        return out

    def _pmt(self, rate: float, nper: int, pv: float) -> float:
        """
        PMT estilo Excel para FV=0 y pagos al fin de período (when=0).
        Devuelve la cuota positiva dada:
        - rate: tasa por período (mensual)
        - nper: número de períodos (meses)
        - pv:   principal (crédito con terceros), valor positivo
        """
        try:
            r = float(rate)
            n = int(nper)
            P = float(pv)
            if n <= 0 or P <= 0:
                return 0.0
            if abs(r) < 1e-12:
                return P / n
            return P * r / (1.0 - (1.0 + r) ** (-n))
        except Exception:
            return 0.0

    # ======================= Productos =======================

    def _project_products(
        self,
        productos: List[Dict[str, Any]],
        g_precios: List[float],
        g_unidades: List[float],
        g_costos: List[float],  # no se usa directamente pero lo dejamos para simetría
    ) -> Dict[str, Any]:
        n = len(g_precios)
        items = []

        for p in productos:
            nombre = p.get("nombre", "producto")
            base_precio = self._to_float(p.get("precioSinIva") or p.get("precioVenta") or 0)
            base_q = self._to_float(p.get("cantidadFacturar") or 0)

            precio = self._apply_growth(base_precio, g_precios)
            unidades = self._apply_growth(base_q, g_unidades)

            total_ingresos_por_ano = [precio[i] * unidades[i] for i in range(n)]

            items.append({
                "nombre": nombre,
                "precio": precio,
                "unidades": unidades,
                "totalIngresosPorAno": total_ingresos_por_ano,
            })

        tot_ingresos = []
        for i in range(n):
            suma_anual = sum(item["totalIngresosPorAno"][i] for item in items)
            tot_ingresos.append(suma_anual)

        return {
            "items": items,
            "totalIngresosProyectados": tot_ingresos
        }

    # ======================= Marketing =======================

    def _project_marketing(self, estrategia_mkt: List[Dict[str, Any]], n: int) -> Dict[str, Any]:
        """
        Construye 'estrategiaMarketing':
        - items[]: cada campaña con su serie de valores por año.
        - totalCostosEstrategiasPorAno[t]: suma por año de todas las campañas.
        """
        items = []
        total = [0.0] * n

        for camp in (estrategia_mkt or []):
            nombre = camp.get("nombre", "estrategia")
            raw_vals = [self._to_float(v) for v in camp.get("valores", [])]
            serie = self._ensure_len(raw_vals, n, fill=0.0)

            for i in range(n):
                total[i] += serie[i]

            items.append({"nombre": nombre, "valores": serie})

        return {
            "items": items,
            "totalCostosEstrategiasPorAno": total
        }

    # ======================= Costos variables =======================

    def _project_costos_variables(
        self,
        productos: List[Dict[str, Any]],
        growth: Dict[str, List[float]],
        g_unidades: List[float],
    ) -> Dict[str, Any]:
        """
        3. INFORMACIÓN PLAN OPERATIVO -> COSTOS VARIABLES
        """
        n = len(g_unidades)

        analisis_costos = self.payload["proyeccionMacro"]["analisisMercado"].get("crecimientoCostos", {})
        inct_pct = self._build_inct_costo_vble_pct_from_growth(analisis_costos, growth, n)
        factors = [1.0 + (p / 100.0) for p in inct_pct]

        items, total = [], [0.0] * n

        for p in productos:
            nombre = p.get("nombre", "producto")

            cu_series_input = self._to_series(p.get("costoVarProdAnoBase", 0), n)
            base_cu = cu_series_input[0] if n > 0 else 0.0

            costo_unitario = [0.0] * n
            if n > 0:
                costo_unitario[0] = base_cu
                for t in range(1, n):
                    costo_unitario[t] = costo_unitario[t - 1] * factors[t]

            q_raw = p.get("cantidadFacturar", 0)
            if isinstance(q_raw, list):
                cantidades = self._to_series(q_raw, n)
            else:
                cantidades = self._apply_growth(self._to_float(q_raw), growth["unidadesPct"])

            costos_series = [costo_unitario[i] * cantidades[i] for i in range(n)]
            for i in range(n):
                total[i] += costos_series[i]

            items.append({
                "nombre": nombre,
                "costoUnitario": costo_unitario,
                "cantidades": cantidades,
                "costosVariablesPorAno": costos_series,
            })

        return {
            "inctCostoVariablePorAno": inct_pct,
            "items": items,
            "totalCostosVariables": total
        }

    # ======================= Activos fijos =======================

    def _project_total_inversion_activos_fijos_por_ano(
        self,
        total_inversion: float,
        propuesta_activos_fijos: List[float],
        tmrr_pct: float,
        n: int
    ) -> List[float]:
        """
        Serie TOTAL INVERSIÓN por año replicando tu Excel.
        """
        tmrr = self._to_float(tmrr_pct) / 100.0

        target_n = max(6, n)
        pesos = self._ensure_len(
            [self._to_float(x) for x in (propuesta_activos_fijos or [])],
            target_n,
            fill=0.0
        )

        out = [0.0] * target_n
        out[0] = total_inversion * (pesos[0] / 100.0)

        for t in range(1, target_n):
            pv = - total_inversion * (pesos[t] / 100.0)
            out[t] = self._fv(rate=tmrr, nper=t + 1, pmt=0.0, pv=pv, when=0)

        if target_n != n:
            out = out[:n]

        return out

    def _project_activos_fijos(
        self,
        activos_blob: Dict[str, Any],
        total_ingresos_proyectados: List[float],
        tarfia_ind_ccio_pct: float,
    ) -> Dict[str, Any]:
        expected = [
            "mueblesEnseres",
            "maquinariaEquipos",
            "vehiculos",
            "terrenos",
            "edificaciones",
            "equiposComputo",
            "activosDiferidos",
        ]

        out: Dict[str, Any] = {}
        total_inversion = 0.0
        n = self.DEFAULT_HORIZON

        def norm_item(it: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "nombre": it.get("nombre"),
                "valor": self._to_float(it.get("valor")) if "valor" in it else None,
                "vidaUtilAnos": int(self._to_float(it.get("vidaUtilAnos"))) if "vidaUtilAnos" in it else 0,
                "valorSalvamento": self._to_float(it.get("valorSalvamento")) if "valorSalvamento" in it else 0,
            }

        for grp in expected:
            data = (activos_blob or {}).get(grp)
            if data and isinstance(data, dict) and isinstance(data.get("items"), list):
                items_norm = [norm_item(it) for it in data.get("items")]

                vida_util = items_norm[0].get("vidaUtilAnos") if items_norm else 0
                valor_salvamento = items_norm[0].get("valorSalvamento") if items_norm else 0.0
                total_valor = sum((x.get("valor") or 0.0) for x in items_norm)

                if vida_util and vida_util > 0:
                    dep_anual = (total_valor - (valor_salvamento or 0.0)) / float(vida_util)
                    if dep_anual < 0:
                        dep_anual = 0.0
                else:
                    dep_anual = 0.0

                dep_por_ano = [dep_anual if (vida_util or 0) > t else 0.0 for t in range(n)]

                out[grp] = {
                    "vidaUtilAnos": vida_util,
                    "valorSalvamento": valor_salvamento,
                    "valorTotalActivoFijo": total_valor,
                    "depAnual": dep_anual,
                    "depPorAno": dep_por_ano,
                    "items": items_norm,
                }
                total_inversion += total_valor
            else:
                out[grp] = None

        out["totalInversionActivosFijos"] = total_inversion

        pf = self.payload.get("planFinanciero", {}).get("planFinanciero", {}) or {}
        propuesta = (pf.get("propuestaFinanciera", {}) or {}).get("activosFijos", []) or []
        tmrr_pct = pf.get("tmrr", 0)

        out["totalInversionActivosFijosPorAno"] = self._project_total_inversion_activos_fijos_por_ano(
            total_inversion=total_inversion,
            propuesta_activos_fijos=propuesta,
            tmrr_pct=tmrr_pct,
            n=6
        )

        total_dep = [0.0] * n
        grupos_a_sumar = [g for g in expected if g != "activosDiferidos"]
        for i in range(n):
            total_dep[i] = sum(
                (out[g]["depPorAno"][i] if out.get(g) and out[g].get("depPorAno") else 0.0)
                for g in grupos_a_sumar
            )
        out["totalDepreciacionPorAno"] = total_dep

        total_amort = [0.0] * n
        dif = out.get("activosDiferidos")
        if dif and isinstance(dif, dict):
            items_dif = dif.get("items") or []
            for it in items_dif:
                valor = self._to_float(it.get("valor")) if it.get("valor") is not None else 0.0
                vida = int(self._to_float(it.get("vidaUtilAnos"))) if it.get("vidaUtilAnos") is not None else 0
                amort_anual = (valor / vida) if vida and vida > 0 else 0.0
                for t in range(n):
                    if vida > t:
                        total_amort[t] += amort_anual
        out["totalAmortizacion"] = total_amort

        factor_icc = self._to_float(tarfia_ind_ccio_pct) / 100.0
        ingresos_len_ok = self._ensure_len(
            [self._to_float(v) for v in (total_ingresos_proyectados or [])],
            4,
            fill=0.0
        )
        out["impIndCcio"] = [factor_icc * v for v in ingresos_len_ok]

        return out

    # ======================= Costos fijos =======================

    def _project_costos_fijos(
        self,
        costos_gastos: Dict[str, Any],
        growth: Dict[str, List[float]],
        n: int,
        *,
        dep_series: List[float],
        amort_series: List[float],
        imp_ind_ccio: List[float],
        publicidad_series: List[float],
        gmf4xmil_pct: float,
        costos_variables_block: Dict[str, Any],
    ) -> Dict[str, Any]:
        inc_cfg = (costos_gastos or {}).get("incrementoEgresos", {}) or {}
        inct_pct = self._build_inct_egresos_pct_from_growth(inc_cfg, growth, n)
        if len(inct_pct) < 2:
            inct_pct = (inct_pct + [0.0, 0.0])[:2]

        items_out: List[Dict[str, Any]] = []
        total_costos = [0.0] * 6
        subtotal_gastos_oper = [0.0] * 6

        def _project_group(arr: List[Dict[str, Any]], tipo: str):
            if not arr:
                return
            for it in arr:
                nombre = it.get("nombre", f"{tipo}")
                base_mensual = self._to_float(it.get("valor", 0.0))

                serie = [0.0] * 6
                serie[0] = base_mensual
                serie[1] = base_mensual * 12.0

                es_gastos_const = nombre.strip().lower() == "gastos de constitución"
                if not es_gastos_const:
                    for t in range(2, 6):
                        pct_t = inct_pct[t - 1] if (t - 1) < len(inct_pct) else 0.0
                        serie[t] = serie[t - 1] * (1.0 + pct_t / 100.0)

                if tipo == "costo":
                    for t in range(1, 6):
                        total_costos[t] += serie[t]
                elif tipo == "gasto":
                    for t in range(1, 6):
                        subtotal_gastos_oper[t] += serie[t]

                items_out.append({
                    "tipo": tipo,
                    "nombre": nombre,
                    "seriePorAno": serie
                })

        _project_group(costos_gastos.get("costos", []) or [], "costo")
        _project_group(costos_gastos.get("gastos", []) or [], "gasto")

        def _fit(series: List[float]) -> List[float]:
            return self._ensure_len([self._to_float(x) for x in (series or [])], n, fill=0.0)

        dep_series = _fit(dep_series)
        amort_series = _fit(amort_series)
        publicidad_series = _fit(publicidad_series)
        imp_ind_ccio = _fit(imp_ind_ccio)

        factor_gmf = self._to_float(gmf4xmil_pct) / 100.0

        cv_total = (costos_variables_block or {}).get("totalCostosVariables", []) or [0.0] * n
        cv_total = _fit(cv_total)

        imp_trans = [0.0] * n
        for t in range(n):
            cf_t = self._to_float(total_costos[t + 1]) if len(total_costos) > (t + 1) else 0.0
            subop_t = self._to_float(subtotal_gastos_oper[t + 1]) if len(subtotal_gastos_oper) > (t + 1) else 0.0
            cv_t = self._to_float(cv_total[t]) if len(cv_total) > t else 0.0
            base_t = cf_t + subop_t + cv_t
            imp_trans[t] = factor_gmf * base_t

        gasto_impuestos = [0.0] * n
        if n > 0:
            gasto_impuestos[0] = imp_trans[0]
        for t in range(1, n):
            icc_add = self._to_float(imp_ind_ccio[t - 1]) if (t - 1) < len(imp_ind_ccio) else 0.0
            gasto_impuestos[t] = imp_trans[t] + icc_add

        return {
            "inctEgresosPorAno": inct_pct,
            "items": items_out,
            "totalCostosFijos": total_costos,
            "subtotalGastosOperativos": subtotal_gastos_oper,
            "gastosPorDepreciacion": dep_series,
            "gastoPorAmortizacion": amort_series,
            "gastoPorImpuestos": gasto_impuestos,
            "gastoPublicidad": publicidad_series,
            "impTransFinan": imp_trans,
        }

    # ======================= Plan administrativo =======================

    def _project_plan_administrativo(
        self,
        salarios_blob: Dict[str, Any],
        growth: Dict[str, List[float]],
        n: int
    ) -> Dict[str, Any]:
        inc = (salarios_blob or {}).get("incrementoSalarial", {}) or {}
        use_ipc = bool(inc.get("ipc"))
        use_other = bool(inc.get("otroPorcentaje"))

        if use_ipc:
            series = self._ensure_len(
                [self._to_float(x) for x in (growth.get("ipcPct") or [])],
                n,
                fill=0.0
            )
        elif use_other:
            series = self._ensure_len(
                [self._to_float(x) for x in (inc.get("incrementoEgresos") or [])],
                n,
                fill=0.0
            )
        else:
            series = [0.0] * n

        return {"incrementoSalarios": series}

    def _project_plan_admin_salarios(
        self,
        incremento_salarios: List[float],
        n: int
    ) -> Dict[str, Any]:
        empleados = (
            self.payload.get("salarioAdmins", {})
            .get("salarioAdmins", {})
            .get("salarioAdmins", [])
            or []
        )

        inc = self._ensure_len([self._to_float(x) for x in (incremento_salarios or [])], n, fill=0.0)

        items_out = []
        total_por_ano = [0.0] * n

        for emp in empleados:
            cargo = emp.get("cargo", "Empleado")
            base_mensual = self._to_float(emp.get("valorMensual", 0.0))

            serie = [0.0] * n
            if n > 0:
                serie[0] = base_mensual * 12.0
                for t in range(1, n):
                    serie[t] = serie[t - 1] * (1.0 + inc[t] / 100.0)

            for t in range(n):
                total_por_ano[t] += serie[t]

            items_out.append({
                "cargo": cargo,
                "baseMensual": base_mensual,
                "salarioAnualPorAno": serie
            })

        return {
            "items": items_out,
            "totalNominaPorAno": total_por_ano
        }

    # ======================= Otra información financiera =======================

    def _project_otra_informacion_financiera(
        self,
        planfin: Dict[str, Any],
        costos_fijos_block: Dict[str, Any],
        total_ingresos_proyectados: List[float],
        activos_fijos_block: Dict[str, Any],
        costos_variables_block: Dict[str, Any],
    ) -> Dict[str, Any]:
        n = self.DEFAULT_HORIZON

        disponible_inicial = self._to_float((planfin or {}).get("disponibleInicial", 0))
        dias_inv_inicial = self._to_float((planfin or {}).get("diasInventarioInicial", 0))
        financ_prop = self._to_float((planfin or {}).get("financiacionPropia", 0))
        tasa_credito_anual = self._to_float((planfin or {}).get("tasaCredito", 0)) / 100.0
        dias_cartera = self._to_float((planfin or {}).get("diasCartera", 0))
        dias_inventario = self._to_float((planfin or {}).get("diasInventario", 0))
        dias_pago_prov = self._to_float((planfin or {}).get("diasPagoProveedores", 0))
        plazoCredito = self._to_float((planfin or {}).get("plazoCredito", 0))

        ingresos = self._ensure_len(
            [self._to_float(x) for x in (total_ingresos_proyectados or [])],
            n,
            0.0
        )

        costos_var = self._ensure_len(
            [self._to_float(x) for x in ((costos_variables_block or {}).get("totalCostosVariables", []) or [])],
            n,
            0.0
        )

        if disponible_inicial == 0:
            capital_trabajo_inicio = 0.0
        else:
            total_costos_fijos_6 = (costos_fijos_block or {}).get("totalCostosFijos", []) or [0.0] * 6
            cf_y1 = self._to_float(total_costos_fijos_6[1]) if len(total_costos_fijos_6) > 1 else 0.0

            total_gastos_oper = (costos_fijos_block or {}).get("totalGastosOperativos", []) or []
            dep_series = (costos_fijos_block or {}).get("gastosPorDepreciacion", []) or []
            amort_series = (costos_fijos_block or {}).get("gastoPorAmortizacion", []) or []

            go_y1 = self._to_float(total_gastos_oper[0]) if len(total_gastos_oper) > 0 else 0.0
            dep_y1 = self._to_float(dep_series[0]) if len(dep_series) > 0 else 0.0
            amort_y1 = self._to_float(amort_series[0]) if len(amort_series) > 0 else 0.0

            base = cf_y1 + go_y1 - dep_y1 - amort_y1
            capital_trabajo_inicio = (base / 12.0) * disponible_inicial

        ingresos_y1 = self._to_float(ingresos[0]) if len(ingresos) > 0 else 0.0
        dias_exist_inventario = (ingresos_y1 / 360.0) * dias_inv_inicial

        total_capital_trabajo = capital_trabajo_inicio + dias_exist_inventario

        activos_total_inversion = self._to_float((activos_fijos_block or {}).get("totalInversionActivosFijos", 0.0))
        total_inversion = total_capital_trabajo + activos_total_inversion

        credito_terceros = total_inversion - financ_prop

        tasa_interes_proy_cred = (1.0 + tasa_credito_anual) ** (1.0 / 12.0) - 1.0

        cuentas_cobrar = [(ingresos[t] * dias_cartera) / 360.0 for t in range(n)]
        inventario_mercancia = [(costos_var[t] * dias_inventario) / 360.0 for t in range(n)]
        proveedores = [(costos_var[t] * dias_pago_prov) / 360.0 for t in range(n)]
        ventas_contado = [ingresos[t] - cuentas_cobrar[t] for t in range(n)]
        compras_contado = [costos_var[t] - proveedores[t] for t in range(n)]

        # cuota mensual estilo Excel (valorCuotaMes)
        valor_cuota_mes = self._pmt(
            rate=tasa_interes_proy_cred,
            nper=int(plazoCredito),
            pv=credito_terceros
        ) if credito_terceros > 0 and plazoCredito > 0 else 0.0

        return {
            "capitalDeTrabajo": {
                "capitalTrabajoInicio": capital_trabajo_inicio,
                "diasExistInventario": dias_exist_inventario,
                "totalCapitalTrabajo": total_capital_trabajo,
            },
            "totalInversion": total_inversion,
            "financiacion": {
                "creditoTerceros": credito_terceros,
                "tasaInteresProyCred": tasa_interes_proy_cred,
                "cuentasCobrar": cuentas_cobrar,
                "inventarioMercancia": inventario_mercancia,
                "proveedores": proveedores,
                "ventasContado": ventas_contado,
                "comprasContado": compras_contado,
                "plazoCredito": plazoCredito,
                "valorCuotaMes": valor_cuota_mes,
            }
        }

    # ======================= Utils de redondeo y conversión =======================

    def _to_float(self, x: Any) -> float:
        try:
            return float(str(x).replace(",", ""))
        except Exception:
            return 0.0

    def _round_up(self, val: Union[float, int]) -> int:
        """Redondea siempre hacia arriba al entero más cercano."""
        try:
            return int(math.ceil(float(val)))
        except Exception:
            return val

    def _round_up_all(self, obj: Any, parent_key: str = "") -> Any:
        """
        Recorre el objeto y redondea todo hacia arriba excepto claves sensibles (% o tasas).
        """
        no_round_keys = {
            "ipcPct", "pibPct", "devaluacionPct", "tasaInteresPct",
            "preciosPct", "unidadesPct", "costosPct",
            "inctCostoVariablePorAno", "inctEgresosPorAno",
            "incrementoSalarios", "tasaInteresProyCred", "valorCuotaMes"
        }

        if isinstance(obj, dict):
            new_dict = {}
            for k, v in obj.items():
                if k in no_round_keys:
                    new_dict[k] = v
                else:
                    new_dict[k] = self._round_up_all(v, parent_key=k)
            return new_dict

        elif isinstance(obj, list):
            return [self._round_up_all(v, parent_key=parent_key) for v in obj]

        elif isinstance(obj, (float, int)):
            if parent_key in no_round_keys:
                return float(obj)
            return self._round_up(obj)
        else:
            return obj
