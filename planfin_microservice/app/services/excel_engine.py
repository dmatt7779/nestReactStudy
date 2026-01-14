# app/services/excel_engine.py
from __future__ import annotations

import shutil
import uuid
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable, Union

from openpyxl import load_workbook


class ExcelTemplateManager:
    """
    Se encarga de gestionar la plantilla base y crear una copia de trabajo
    por cada request, para evitar pisarse entre usuarios.
    """

    def __init__(
        self,
        template_path: str = "excel_templates/Plantilla_Plan_Financiero_empty.xlsx",
        work_root: str = "/tmp",
    ) -> None:
        self.template_path = Path(template_path)
        self.work_root = Path(work_root)

    def create_workbook_copy(self) -> Path:
        """
        Crea una copia única de la plantilla en /tmp/planfin_<uuid>/planfin_template.xlsx
        y devuelve la ruta al archivo nuevo. 
        """
        if not self.template_path.exists():
            raise FileNotFoundError(f"Template not found: {self.template_path}")

        work_dir = self.work_root / f"planfin_{uuid.uuid4().hex}"
        work_dir.mkdir(parents=True, exist_ok=True)

        dest = work_dir / self.template_path.name
        shutil.copy2(self.template_path, dest)
        return dest


class ExcelInputWriter:
    """
    Encapsula la lógica de tomar el payload JSON y mapearlo a celdas
    de la hoja 'Instrucciones'.
    """

    SHEET_NAME = "Instrucciones"

    def __init__(self, template_manager: ExcelTemplateManager) -> None:
        self.template_manager = template_manager

    # ---------- helpers internos ----------

    def _pick(
        self,
        root: Dict[str, Any],
        path: List[Union[str, int]],
        default: Any = None
    ) -> Any:
        cur: Any = root
        for key in path:
            if not isinstance(cur, dict) or key not in cur:
                return default
            cur = cur[key]
        return cur

    def _write_scalar(
        self,
        ws,
        cell: str,
        payload: Dict[str, Any],
        path: List[Union[str, int]],
        processor: Optional[Callable[[Any], Any]] = None,
    ) -> None:
        value = self._pick(payload, path, default=None)
        if value is None:
            return
        if processor:
            value = processor(value)
        ws[cell] = value

    def _write_vector_row(
        self,
        ws,
        row: int,
        col_start: int,
        values: List[Any],
    ) -> None:
        """
        Escribe una lista horizontalmente:
        - row: fila en Excel (1-based)
        - col_start: columna inicial (1-based: 1=A, 2=B, 3=C, ...)
        """
        for offset, v in enumerate(values):
            ws.cell(
                row=row,
                column=col_start + offset,
                value=v,
            )

    def _write_vector_col(
        self,
        ws,
        row_start: int,
        col: int,
        values: List[Any],
    ) -> None:
        """
        Escribe una lista verticalmente:
        - row_start: fila inicial en Excel (1-based)
        - col: columna fija (1-based: 1=A, 2=B, 3=C, ...)
        """
        for offset, v in enumerate(values):
            ws.cell(
                row=row_start + offset,
                column=col,
                value=v,
            )

    def _to_percent_decimal(self, value: Any) -> float:
        """
        Convierte algo tipo 5.4 (o "5,4") a 0.054
        para que en una celda con formato % se vea 5,4%.
        """
        if value is None:
            return 0.0
        s = str(value).replace(",", ".")
        try:
            f = float(s)
        except ValueError:
            return 0.0
        return f / 100.0

    def _to_number(self, value: Any) -> Optional[float]:
        """
        Convierte '1000.00', '1.234,56', 1000, 1000.0, etc. a float.
        Devuelve None si no se puede convertir.
        """
        if value is None or value == "":
            return None

        s = str(value).strip()
        # Normalizamos: coma a punto
        s = s.replace(",", ".")

        try:
            return float(s)
        except ValueError:
            return None

    # ---------- API pública ----------

    def write_input(self, payload: Dict[str, Any]) -> Path:
        """
        1) Crea una copia de la plantilla.
        2) Abre la hoja 'Instrucciones'.
        3) Escribe los campos del payload.
        4) Guarda y devuelve la ruta del nuevo archivo.
        """
        workbook_path = self.template_manager.create_workbook_copy()
        wb = load_workbook(workbook_path)
        if self.SHEET_NAME not in wb.sheetnames:
            raise ValueError(f"Sheet '{self.SHEET_NAME}' not found in template")

        ws = wb[self.SHEET_NAME]

        # ======== projectInfo ========
        #   projectInfo.projectName  -> Instrucciones!C7
        #   projectInfo.openingYear -> Instrucciones!C23
        self._write_scalar(ws, "C7", payload, ["projectInfo", "projectName"])
        self._write_scalar(ws, "C23", payload, ["projectInfo", "openingYear"])

        # ======== proyeccionMacro ========

        ipc_vals = self._pick(
            payload,
            ["proyeccionMacro", "proyeccionesMacroeconomicas", "ipc"],
            default=[],
        ) or []
        if isinstance(ipc_vals, list) and ipc_vals:
            ipc_vals = [self._to_percent_decimal(v) for v in ipc_vals]
            self._write_vector_row(ws, row=30, col_start=3, values=ipc_vals)

        devaluacion_vals = self._pick(
            payload,
            ["proyeccionMacro", "proyeccionesMacroeconomicas", "devaluacion"],
            default=[],
        ) or []
        if isinstance(devaluacion_vals, list) and devaluacion_vals:
            devaluacion_vals = [self._to_percent_decimal(v) for v in devaluacion_vals]
            self._write_vector_row(ws, row=31, col_start=3, values=devaluacion_vals)

        tasaInteres_vals = self._pick(
            payload,
            ["proyeccionMacro", "proyeccionesMacroeconomicas", "tasaInteres"],
            default=[],
        ) or []
        if isinstance(tasaInteres_vals, list) and tasaInteres_vals:
            tasaInteres_vals = [self._to_percent_decimal(v) for v in tasaInteres_vals]
            self._write_vector_row(ws, row=32, col_start=3, values=tasaInteres_vals)

        pib_vals = self._pick(
            payload,
            ["proyeccionMacro", "proyeccionesMacroeconomicas", "pib"],
            default=[],
        ) or []
        if isinstance(pib_vals, list) and pib_vals:
            pib_vals = [self._to_percent_decimal(v) for v in pib_vals]
            self._write_vector_row(ws, row=33, col_start=3, values=pib_vals)

        productos = self._pick(
            payload,
            ["proyeccionMacro", "producto"],
            default=[],
        ) or []
        if isinstance(productos, list) and productos:
            ws["G41"] = len(productos)
            producto_nombre = [p.get("nombre") for p in productos]
            self._write_vector_col(ws, row_start=43, col=5, values=producto_nombre)

        crecimientoUnidades = self._pick(
            payload,
            ["proyeccionMacro", "analisisMercado", "crecimientoUnidades"],
            default={},
        ) or {}

        if crecimientoUnidades.get("ipc") is True:
            ws["C77"] = "X"
        if crecimientoUnidades.get("pib") is True:
            ws["C75"] = "X"
        if crecimientoUnidades.get("estrategia") is True:
            ws["C76"] = "X"
            crecimiento_values = crecimientoUnidades.get("crecimientoCantidades", [])[1:]
            crecimiento_percent_values = [self._to_percent_decimal(v) for v in crecimiento_values]
            self._write_vector_row(ws, row=80, col_start=4, values=crecimiento_percent_values)

        crecimientoPrecios = self._pick(
            payload,
            ["proyeccionMacro", "analisisMercado", "crecimientoPrecios"],
            default={},
        ) or {}

        if crecimientoPrecios.get("ipc") is True:
            ws["C85"] = "X"
        if crecimientoPrecios.get("pib") is True:
            ws["C83"] = "X"
        if crecimientoPrecios.get("estrategia") is True:
            ws["C84"] = "X"
            crecimiento_values = crecimientoPrecios.get("crecimientoCantidades", [])[1:]
            crecimiento_percent_values = [self._to_percent_decimal(v) for v in crecimiento_values]
            self._write_vector_row(ws, row=88, col_start=4, values=crecimiento_percent_values)

        crecimientoCostos = self._pick(
            payload,
            ["proyeccionMacro", "analisisMercado", "crecimientoCostos"],
            default={},
        ) or {}

        if crecimientoCostos.get("ipc") is True:
            ws["C176"] = "X"
        if crecimientoCostos.get("pib") is True:
            ws["C174"] = "X"
        if crecimientoCostos.get("estrategia") is True:
            ws["C175"] = "X"
            crecimiento_values = crecimientoCostos.get("crecimientoCantidades", [])[1:]
            crecimiento_percent_values = [self._to_percent_decimal(v) for v in crecimiento_values]
            self._write_vector_row(ws, row=179, col_start=4, values=crecimiento_percent_values)

        self._write_scalar(
            ws,
            "H91",
            payload,
            ["proyeccionMacro", "analisisMercado", "tasaIva"],
        )

        cantidades_raw = [p.get("cantidadFacturar") for p in productos]
        cantidades_val: List[Optional[int]] = []

        for raw in cantidades_raw:
            num = self._to_number(raw)
            if num is None:
                cantidades_val.append(None)
            else:
                cantidades_val.append(int(num))

        self._write_vector_col(ws, row_start=94, col=5, values=cantidades_val)

        precios_sin_iva_raw = [p.get("precioSinIva") for p in productos]
        precios_sin_iva_val = [self._to_number(v) for v in precios_sin_iva_raw]
        self._write_vector_col(ws, row_start=94, col=7, values=precios_sin_iva_val)

        # ======== estrategiaMarketing ========
        estrategia_marketing = self._pick(
            payload,
            ["proyeccionMacro", "estrategiaMarketing"],
            default=[],
        ) or []
        if isinstance(estrategia_marketing, list) and estrategia_marketing:
            estrategias = [estrategia.get("nombre") for estrategia in estrategia_marketing]
            self._write_vector_col(ws, row_start=128, col=2, values=estrategias)
            for idx, estrategia in enumerate(estrategia_marketing):
                valores = estrategia.get("valores", [])
                if valores:
                    self._write_vector_row(ws, row=128 + idx, col_start=3, values=valores)

        # ======== costosGastos ========

        costos = self._pick(
            payload,
            ["costosGastos", "costos"],
            default=[],
        ) or []
        if isinstance(costos, list) and costos:
            nombres_costos = [costo.get("nombre") for costo in costos]
            self._write_vector_col(ws, row_start=191, col=2, values=nombres_costos)
            valores_costos = [costo.get("valor") for costo in costos]
            self._write_vector_col(ws, row_start=191, col=4, values=valores_costos)

        gastos = self._pick(
            payload,
            ["costosGastos", "gastos"],
            default=[],
        ) or []
        if isinstance(gastos, list) and gastos:
            nombres_gastos = [gasto.get("nombre") for gasto in gastos]
            self._write_vector_col(ws, row_start=208, col=2, values=nombres_gastos)
            valores_gastos = [gasto.get("valor") for gasto in gastos]
            self._write_vector_col(ws, row_start=208, col=4, values=valores_gastos)

        crecimiento_costos_gastos = self._pick(
            payload,
            ["costosGastos", "incrementoEgresos"],
            default={},
        ) or {}

        if crecimiento_costos_gastos.get("ipc") is True:
            ws["C230"] = "X"
        if crecimiento_costos_gastos.get("estrategia") is True:
            ws["C231"] = "X"
            crecimiento_values = crecimiento_costos_gastos.get("incrementoEgresos", [])
            self._write_vector_row(ws, row=234, col_start=4, values=crecimiento_values)

        # ======== activosFijos ========

        muebles_enseres = self._pick(
            payload,
            ["activosFijos", "activosFijos", "mueblesEnseres", "items"],
            default=[],
        ) or []
        if isinstance(muebles_enseres, list) and muebles_enseres:
            nombre_items = [item.get("nombre") for item in muebles_enseres]
            self._write_vector_col(ws, row_start=243, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in muebles_enseres]
            self._write_vector_col(ws, row_start=243, col=5, values=valor_items)

            ws["G243"] = self._pick(payload, ["activosFijos", "activosFijos", "mueblesEnseres", "vidaUtilAnos"], default=5)
            ws["G246"] = self._pick(payload, ["activosFijos", "activosFijos", "mueblesEnseres", "valorSalvamento"], default=0)
        else:
            ws["G243"] = 5
            ws["G246"] = 0

        maquinaria_equipos = self._pick(
            payload,
            ["activosFijos", "activosFijos", "maquinariaEquipos", "items"],
            default=[],
        ) or []
        if isinstance(maquinaria_equipos, list) and maquinaria_equipos:
            nombre_items = [item.get("nombre") for item in maquinaria_equipos]
            self._write_vector_col(ws, row_start=257, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in maquinaria_equipos]
            self._write_vector_col(ws, row_start=257, col=5, values=valor_items)

            ws["G257"] = self._pick(payload, ["activosFijos", "activosFijos", "maquinariaEquipos", "vidaUtilAnos"], default=5)
            ws["G269"] = self._pick(payload, ["activosFijos", "activosFijos", "maquinariaEquipos", "valorSalvamento"], default=0)
        else:
            ws["G257"] = 5
            ws["G269"] = 0

        vehiculos = self._pick(
            payload,
            ["activosFijos", "activosFijos", "vehiculos", "items"],
            default=[],
        ) or []
        if isinstance(vehiculos, list) and vehiculos:
            nombre_items = [item.get("nombre") for item in vehiculos]
            self._write_vector_col(ws, row_start=273, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in vehiculos]
            self._write_vector_col(ws, row_start=273, col=5, values=valor_items)

            ws["G273"] = self._pick(payload, ["activosFijos", "activosFijos", "vehiculos", "vidaUtilAnos"], default=5)
            ws["G276"] = self._pick(payload, ["activosFijos", "activosFijos", "vehiculos", "valorSalvamento"], default=0)
        else:
            ws["G273"] = 5
            ws["G276"] = 0

        terrenos = self._pick(
            payload,
            ["activosFijos", "activosFijos", "terrenos", "items"],
            default=[],
        ) or []
        if isinstance(terrenos, list) and terrenos:
            nombre_items = [item.get("nombre") for item in terrenos]
            self._write_vector_col(ws, row_start=280, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in terrenos]
            self._write_vector_col(ws, row_start=280, col=5, values=valor_items)

        edificaciones = self._pick(
            payload,
            ["activosFijos", "activosFijos", "edificaciones", "items"],
            default=[],
        ) or []
        if isinstance(edificaciones, list) and edificaciones:
            nombre_items = [item.get("nombre") for item in edificaciones]
            self._write_vector_col(ws, row_start=284, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in edificaciones]
            self._write_vector_col(ws, row_start=284, col=5, values=valor_items)

            ws["G284"] = self._pick(payload, ["activosFijos", "activosFijos", "edificaciones", "vidaUtilAnos"], default=20)
            ws["G287"] = self._pick(payload, ["activosFijos", "activosFijos", "edificaciones", "valorSalvamento"], default=0)
        else:
            ws["G284"] = 20
            ws["G287"] = 0

        equipos_computo = self._pick(
            payload,
            ["activosFijos", "activosFijos", "equiposComputo", "items"],
            default=[],
        ) or []
        if isinstance(equipos_computo, list) and equipos_computo:
            nombre_items = [item.get("nombre") for item in equipos_computo]
            self._write_vector_col(ws, row_start=290, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in equipos_computo]
            self._write_vector_col(ws, row_start=290, col=5, values=valor_items)

            ws["G290"] = self._pick(payload, ["activosFijos", "activosFijos", "equiposComputo", "vidaUtilAnos"], default=5)
            ws["G293"] = self._pick(payload, ["activosFijos", "activosFijos", "equiposComputo", "valorSalvamento"], default=0)
        else:
            ws["G290"] = 5
            ws["G293"] = 0

        activos_diferidos = self._pick(
            payload,
            ["activosFijos", "activosFijos", "activosDiferidos", "items"],
            default=[],
        ) or []
        if isinstance(activos_diferidos, list) and activos_diferidos:
            nombre_items = [item.get("nombre") for item in activos_diferidos]
            self._write_vector_col(ws, row_start=297, col=3, values=nombre_items)
            valor_items = [item.get("valor") for item in activos_diferidos]
            self._write_vector_col(ws, row_start=297, col=5, values=valor_items)

            ws["G297"] = self._pick(payload, ["activosFijos", "activosFijos", "activosDiferidos", "vidaUtilAnos"], default=3)
        else:
            ws["G297"] = 3

        # ======== salarioAdmins ========

        salario_admins = self._pick(
            payload,
            ["salarioAdmins", "salarioAdmins", "salarioAdmins"],
            default=[],
        ) or []
        if isinstance(salario_admins, list) and salario_admins:
            cargos = [cargo.get("cargo") for cargo in salario_admins]
            self._write_vector_col(ws, row_start=312, col=2, values=cargos)
            valores_mensuales = [salario.get("valorMensual") for salario in salario_admins]
            self._write_vector_col(ws, row_start=312, col=4, values=valores_mensuales)

        # ======== incremento salarial ========
        incremento_salarial = self._pick(
            payload,
            ["salarioAdmins", "salarioAdmins", "incrementoSalarial"],
            default={},
        ) or {}
        if incremento_salarial.get("ipc") is True:
            ws["C324"] = "X"
        if incremento_salarial.get("otroPorcentaje") is True:
            ws["C325"] = "X"
            crecimiento_values = incremento_salarial.get("incrementoEgresos", [])
            crecimiento_percent_values = [self._to_percent_decimal(v) for v in crecimiento_values]
            self._write_vector_row(ws, row=328, col_start=4, values=crecimiento_percent_values)

        # ======== planFinanciero ========
        self._write_scalar(ws, "C335", payload, ["planFinanciero", "planFinanciero", "disponibleInicial"])
        self._write_scalar(ws, "C337", payload, ["planFinanciero", "planFinanciero", "diasInventarioInicial"])
        self._write_scalar(ws, "C339", payload, ["planFinanciero", "planFinanciero", "financiacionPropia"], processor=self._to_number)
        self._write_scalar(ws, "C342", payload, ["planFinanciero", "planFinanciero", "plazoCredito"])
        self._write_scalar(ws, "C344", payload, ["planFinanciero", "planFinanciero", "tasaCredito"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C346", payload, ["planFinanciero", "planFinanciero", "tasaProveedores"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C348", payload, ["planFinanciero", "planFinanciero", "tmrr"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C350", payload, ["planFinanciero", "planFinanciero", "tasaReinversion"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C352", payload, ["planFinanciero", "planFinanciero", "impuestosRenta"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C354", payload, ["planFinanciero", "planFinanciero", "diasCartera"])
        self._write_scalar(ws, "C356", payload, ["planFinanciero", "planFinanciero", "diasInventario"])
        self._write_scalar(ws, "C358", payload, ["planFinanciero", "planFinanciero", "diasPagoProveedores"])
        self._write_scalar(ws, "C360", payload, ["planFinanciero", "planFinanciero", "tarfiaIndCcio"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C362", payload, ["planFinanciero", "planFinanciero", "gmf4xmil"], processor=self._to_percent_decimal)
        self._write_scalar(ws, "C364", payload, ["planFinanciero", "planFinanciero", "saldoMinCaja"], processor=self._to_number)

        activos_fijos = self._pick(
            payload,
            ["planFinanciero", "planFinanciero", "propuestaFinanciera", "activosFijos"],
            default=[],
        ) or []
        activos_fijos = [self._to_percent_decimal(v) for v in activos_fijos]
        self._write_vector_row(ws, row=370, col_start=3, values=activos_fijos)

        utilidad_dividendos = self._pick(
            payload,
            ["planFinanciero", "planFinanciero", "propuestaFinanciera", "utilidadNetaDividendo"],
            default=[],
        ) or []
        utilidad_dividendos = [self._to_percent_decimal(v) for v in utilidad_dividendos][1:]
        self._write_vector_row(ws, row=375, col_start=5, values=utilidad_dividendos)
        wb.save(workbook_path)
        return workbook_path


class ExcelOutputReader:
    """
    Se encarga de leer hojas clave del Excel ya recalculado y mapearlas a JSON.
    Ajusta los rangos de celdas según tu plantilla real.
    """

    SHEET_ER = "Estado de resultados"
    SHEET_FLUJO = "Flujo de Efectivo"
    SHEET_ESF = "Estado Situación Financ (ESF)"
    SHEET_FUJ = "Flujo de Caja"

    SHEET_WACC = "wacc"

    SHEET_IND_LIQUIDEZ = "Ind Liquidez"
    SHEET_IND_ENDEUDAMIENTO = "Ind Endeudamiento"

    SHEET_IND_RENTABILIDAD = "Ind Rentabilidad"
    SHEET_IND_GENERACION_VALOR = "Ind. Generacion Valor"


    def read_outputs(self, workbook_path: Union[str, Path]) -> Dict[str, Any]:
        workbook_path = Path(workbook_path)

        # --- DEBUG: ver hojas y fórmulas crudas (data_only=False) ---
        wb_raw = load_workbook(workbook_path, data_only=False)
        print("[ExcelOutputReader] Sheets:", wb_raw.sheetnames)
        if self.SHEET_ER in wb_raw.sheetnames:
            # celda que tiene fórmula
            ws_dbg = wb_raw[self.SHEET_ER]
            print("[ExcelOutputReader][DEBUG] C16 raw:", ws_dbg["C16"].value)

        # --- Lectura de valores calculados ---
        wb = load_workbook(workbook_path, data_only=True)
        out: Dict[str, Any] = {}

        # ======== Estado Resultados ========
        if self.SHEET_ER in wb.sheetnames:
            ws_er = wb[self.SHEET_ER]

            ventas = [cell.value for cell in ws_er["C9":"G9"][0]]
            costo_ventas = [cell.value for cell in ws_er["C10":"G10"][0]]
            utilidad_bruta = [cell.value for cell in ws_er["C12":"G12"][0]]
            gastos_operativos = [cell.value for cell in ws_er["C14":"G14"][0]]
            utilidad_antes_imp_int = [cell.value for cell in ws_er["C16":"G16"][0]]
            gastos_financieros = [cell.value for cell in ws_er["C18":"G18"][0]]
            ingresos_financieros = [cell.value for cell in ws_er["C19":"G19"][0]]
            utilidad_antes_imp = [cell.value for cell in ws_er["C21":"G21"][0]]
            impuestos = [cell.value for cell in ws_er["C23":"G23"][0]]
            utilidad_neta = [cell.value for cell in ws_er["C25":"G25"][0]]

            out["estadoResultados"] = {
                "ventas": ventas,
                "costosVentas": costo_ventas,
                "utilidadBruta": utilidad_bruta,
                "gastosOperativos": gastos_operativos,
                "utilidadAntesImpInt": utilidad_antes_imp_int,
                "gastosFinancieros": gastos_financieros,
                "ingresosFinancieros": ingresos_financieros,
                "utilidadAntesImp": utilidad_antes_imp,
                "impuestos": impuestos,
                "utilidadNeta": utilidad_neta,
            }

        # ======== Flujo Efectivo ========
        if self.SHEET_FLUJO in wb.sheetnames:
            ws_flujo = wb[self.SHEET_FLUJO]
            # Actividad de operacion
            ventasContado = [cell.value for cell in ws_flujo["E11":"I11"][0]]
            recuperacionCartera = [cell.value for cell in ws_flujo["F12":"I12"][0]]
            costosOperativos = [cell.value for cell in ws_flujo["E13":"I13"][0]]
            gastosOperativos = [cell.value for cell in ws_flujo["E14":"I14"][0]]
            pagoProveedores = [cell.value for cell in ws_flujo["F15":"I15"][0]]
            inversionInventarioInicial = ws_flujo["D16"].value
            flujoEfectivoImpuestos = [cell.value for cell in ws_flujo["F17":"I17"][0]]
            depreciacionAmortizacion = [cell.value for cell in ws_flujo["E18":"I18"][0]]
            # Actividad de financiacion
            capitalInicialSocios = ws_flujo["D23"].value
            adquiPrestamos = ws_flujo["D24"].value
            feCapitalAdicionalSocios = [cell.value for cell in ws_flujo["E25":"I25"][0]]
            rendimientosFinancieros = [cell.value for cell in ws_flujo["F26":"I26"][0]]
            servicioDeuda = [cell.value for cell in ws_flujo["E27":"I27"][0]]
            flujoEfectivoIntereses = [cell.value for cell in ws_flujo["E28":"I28"][0]]
            flujoEfectivoDividendos = [cell.value for cell in ws_flujo["F29":"I29"][0]]
            # Actividad Inversion
            ventaActivosFijos = ws_flujo["I34"].value
            inversionActivosFijos = [cell.value for cell in ws_flujo["D35":"I35"][0]]
            excedenteDeficitEfectivo = [cell.value for cell in ws_flujo["D38":"I38"][0]]
            aporteSocios = [cell.value for cell in ws_flujo["D40":"I40"][0]]
            flujoEfectivoSaldoInicial = [cell.value for cell in ws_flujo["D42":"I42"][0]]
            flujoEfectivoSaldoFinal = [cell.value for cell in ws_flujo["D44":"I44"][0]]

            out["flujoEfectivo"] = {
                "actividadOperacion": {
                    "ventasContado": ventasContado,
                    "recuperacionCartera": recuperacionCartera,
                    "costosOperativos": costosOperativos,
                    "gastosOperativos": gastosOperativos,
                    "pagoProveedores": pagoProveedores,
                    "inversionInventarioInicial": inversionInventarioInicial,
                    "flujoEfectivoImpuestos": flujoEfectivoImpuestos,
                },
                "actividadFinanciacion": {
                    "depreciacionAmortizacion": depreciacionAmortizacion,
                    "capitalInicialSocios": capitalInicialSocios,
                    "adquiPrestamos": adquiPrestamos,
                    "feCapitalAdicionalSocios": feCapitalAdicionalSocios,
                    "rendimientosFinancieros": rendimientosFinancieros,
                    "servicioDeuda": servicioDeuda,
                    "flujoEfectivoIntereses": flujoEfectivoIntereses,
                    "flujoEfectivoDividendos": flujoEfectivoDividendos,
                },
                "actividadInversion": {
                    "ventaActivosFijos": ventaActivosFijos,
                    "inversionActivosFijos": inversionActivosFijos,
                },
                "excedenteDeficitEfectivo": excedenteDeficitEfectivo,
                "aporteSocios": aporteSocios,
                "flujoEfectivoSaldoInicial": flujoEfectivoSaldoInicial,
                "flujoEfectivoSaldoFinal": flujoEfectivoSaldoFinal,
            }

        # ======== Estado Situación Financ (ESF) ========
        if self.SHEET_ESF in wb.sheetnames:
            ws_esf = wb[self.SHEET_ESF]
            # Activos Corrientes
            esfDisponible = [cell.value for cell in ws_esf["C10":"H10"][0]]
            esfInversionesTemporales = [cell.value for cell in ws_esf["D11":"H11"][0]]
            esfPorCobrar = [cell.value for cell in ws_esf["D12":"H12"][0]]
            esfInventarios = [cell.value for cell in ws_esf["C13":"H13"][0]]
            esfOtrosActivos = ws_esf["H14"].value
            esfTotalActivosCorrientes = [cell.value for cell in ws_esf["C16":"H16"][0]]
            # Activos Largo Plazo
            mueblesEnseres = [cell.value for cell in ws_esf["C20":"H20"][0]]
            equipoMaquinaria = [cell.value for cell in ws_esf["C21":"H21"][0]]
            vehiculos = [cell.value for cell in ws_esf["C22":"H22"][0]]
            terrenos = [cell.value for cell in ws_esf["C23":"H23"][0]]
            edificaciones = [cell.value for cell in ws_esf["C24":"H24"][0]]
            equiposComputo = [cell.value for cell in ws_esf["C25":"H25"][0]]
            depreciacionAcumulada = [cell.value for cell in ws_esf["C26":"H26"][0]]
            activosDiferidos = [cell.value for cell in ws_esf["C27":"H27"][0]]
            amortizacionAcumulada = [cell.value for cell in ws_esf["C28":"H28"][0]]
            totalActivosNoCorrientes = [cell.value for cell in ws_esf["C30":"H30"][0]]
            # Pasivos corrientes
            proveedores = [cell.value for cell in ws_esf["C36":"H36"][0]]
            impuestosPorPagar = [cell.value for cell in ws_esf["D37":"H37"][0]]
            pagarSociosAno1 = ws_esf["D38"].value
            pagarSocios = [cell.value for cell in ws_esf["D39":"H39"][0]]
            obligacionesFinancierasCor = [cell.value for cell in ws_esf["C40":"H40"][0]]
            totalPasivosCorrientes = [cell.value for cell in ws_esf["C42":"H42"][0]]
            # Pasivos no corrientes
            obligacionesFinancierasNoCor = [cell.value for cell in ws_esf["C46":"H46"][0]]
            totalPasivosNoCorrientes = [cell.value for cell in ws_esf["C48":"H48"][0]]
            # Patrimonio
            capital = [cell.value for cell in ws_esf["C54":"H54"][0]]
            esfCapitalAdicionalSocios = [cell.value for cell in ws_esf["C55":"H55"][0]]
            reservaLegal = [cell.value for cell in ws_esf["C56":"H56"][0]]
            utilidadRetenidas = [cell.value for cell in ws_esf["C57":"H57"][0]]
            utilidadPeriodo = [cell.value for cell in ws_esf["C58":"H58"][0]]
            
            #Totales
            totalActivos = [cell.value for cell in ws_esf["C32":"H32"][0]]
            totalPasivos = [cell.value for cell in ws_esf["C50":"H50"][0]]
            totalPatrimonio = [cell.value for cell in ws_esf["C60":"H60"][0]]
            totalPasivosPatrimonio = [cell.value for cell in ws_esf["C62":"H62"][0]]
            decisionJuntaDirectiva = [cell.value for cell in ws_esf["C64":"H64"][0]]
            
            out["EstadoSituacionFinanc"] = {
                "activosCorrientes": {
                    "esfDisponible": esfDisponible,
                    "esfInversionesTemporales": esfInversionesTemporales,
                    "esfPorCobrar": esfPorCobrar,
                    "esfInventarios": esfInventarios,
                    "esfOtrosActivos": esfOtrosActivos,
                    "esfTotalActivosCorrientes": esfTotalActivosCorrientes,
                },
                "activosLargoPlazo": {
                    "mueblesEnseres": mueblesEnseres,
                    "equipoMaquinaria": equipoMaquinaria,
                    "vehiculos": vehiculos,
                    "terrenos": terrenos,
                    "edificaciones": edificaciones,
                    "equiposComputo": equiposComputo,
                    "depreciacionAcumulada": depreciacionAcumulada,
                    "activosDiferidos": activosDiferidos,
                    "amortizacionAcumulada": amortizacionAcumulada,
                    "totalActivosNoCorrientes": totalActivosNoCorrientes,
                },
                "pasivosCorrientes": {
                    "proveedores": proveedores,
                    "impuestosPorPagar": impuestosPorPagar,
                    "pagarSociosAno1": pagarSociosAno1,
                    "pagarSocios": pagarSocios,
                    "obligacionesFinancierasCor": obligacionesFinancierasCor,
                    "totalPasivosCorrientes": totalPasivosCorrientes,
                },
                "pasivosNoCorrientes": {
                    "obligacionesFinancierasNoCor": obligacionesFinancierasNoCor,
                    "totalPasivosNoCorrientes": totalPasivosNoCorrientes,
                },
                "patrimonio": {
                    "capital": capital,
                    "esfCapitalAdicionalSocios": esfCapitalAdicionalSocios,
                    "reservaLegal": reservaLegal,
                    "utilidadRetenidas": utilidadRetenidas,
                    "utilidadPeriodo": utilidadPeriodo,
                },
                "totalActivos": totalActivos,
                "totalPasivos": totalPasivos,
                "totalPatrimonio": totalPatrimonio,
                "totalPasivosPatrimonio": totalPasivosPatrimonio,
                "decisionJuntaDirectiva": decisionJuntaDirectiva,
            }

        # ======== Flujo de Caja ========
        if self.SHEET_FUJ in wb.sheetnames:
            ws_fuj = wb[self.SHEET_FUJ]
            
            fujVentas = [cell.value for cell in ws_fuj["D9":"H9"][0]]
            fujCostos = [cell.value for cell in ws_fuj["D10":"H10"][0]]
            fujGastosOperativos = [cell.value for cell in ws_fuj["D11":"H11"][0]]
            fujUtilidadOperativa = [cell.value for cell in ws_fuj["D13":"H13"][0]]
            fujImpRentaOperativo = [cell.value for cell in ws_fuj["E15":"H15"][0]]
            fujBeneficioFiscal = [cell.value for cell in ws_fuj["E16":"H16"][0]]
            fujUtilOperDespuesImpuesto = [cell.value for cell in ws_fuj["D18":"H18"][0]]
            fujDepresiacionAmort = [cell.value for cell in ws_fuj["D20":"H20"][0]]
            fujCajaBrutoOperativo = [cell.value for cell in ws_fuj["C22":"H22"][0]]
            tirProyecto = ws_fuj["C24"].value
            tmrrCok = ws_fuj["C25"].value
            tirModificado = ws_fuj["C26"].value
            vpnProyectoTmrr = ws_fuj["C27"].value
            capitalNetoKtno = [cell.value for cell in ws_fuj["E31":"H31"][0]]
            escudoFiscal = [cell.value for cell in ws_fuj["D32":"H32"][0]]
            fujServicioDeuda = [cell.value for cell in ws_fuj["D36":"H36"][0]]
            fujGastosFinancieros = [cell.value for cell in ws_fuj["D37":"H37"][0]]
            fujAportInicialSocios = ws_fuj["C38"].value
            fujAporteAdicionalSocios = [cell.value for cell in ws_fuj["D39":"H39"][0]]
            fujCuentaPagarSocios = [cell.value for cell in ws_fuj["D40":"H40"][0]]
            flujoCajaLibreInver = [cell.value for cell in ws_fuj["C42":"H42"][0]]
            tirInversionista = ws_fuj["C44"].value
            fujTmrr = ws_fuj["C45"].value
            fujTirModificadaInver = ws_fuj["C46"].value
            fujVpn = ws_fuj["C47"].value

            out["flujoCaja"] = {
                "fujVentas": fujVentas,
                "fujCostos": fujCostos,
                "fujGastosOperativos": fujGastosOperativos,
                "fujUtilidadOperativa": fujUtilidadOperativa,
                "fujImpRentaOperativo": fujImpRentaOperativo,
                "fujBeneficioFiscal": fujBeneficioFiscal,
                "fujUtilOperDespuesImpuesto": fujUtilOperDespuesImpuesto,
                "fujDepresiacionAmort": fujDepresiacionAmort,
                "fujCajaBrutoOperativo": fujCajaBrutoOperativo,
                "tirProyecto": tirProyecto,
                "tmrrCok": tmrrCok,
                "tirModificado": tirModificado,
                "vpnProyectoTmrr": vpnProyectoTmrr,
                "capitalNetoKtno": capitalNetoKtno,
                "escudoFiscal": escudoFiscal,
                "fujServicioDeuda": fujServicioDeuda,
                "fujGastosFinancieros": fujGastosFinancieros,
                "fujAportInicialSocios": fujAportInicialSocios,
                "fujAporteAdicionalSocios": fujAporteAdicionalSocios,
                "fujCuentaPagarSocios": fujCuentaPagarSocios,
                "flujoCajaLibreInver": flujoCajaLibreInver,
                "tirInversionista": tirInversionista,
                "fujTmrr": fujTmrr,
                "fujTirModificadaInver": fujTirModificadaInver,
                "fujVpn": fujVpn,
            }

        # ======== wacc ========
        if self.SHEET_WACC in wb.sheetnames:
            ws_wacc = wb[self.SHEET_WACC]

            
            
        return out

class ExcelEngineService:
    """
    Servicio de alto nivel que orquesta el uso de la plantilla:
    1) Escribir input en 'Instrucciones' de una copia de la plantilla.
    2) Ejecutar LibreOffice headless para recalcular.
    3) Leer hojas clave y mapearlas a JSON.
    """

    def __init__(self, payload: Dict[str, Any]) -> None:
        self.payload = payload
        self.template_manager = ExcelTemplateManager()
        self.input_writer = ExcelInputWriter(self.template_manager)

    def write_input_only(self) -> str:
        """
        Devuelve la ruta del archivo Excel de trabajo (dentro del contenedor)
        después de escribir el input en 'Instrucciones'.
        """
        path = self.input_writer.write_input(self.payload)
        return str(path)

    def _run_libreoffice_calc(self, workbook_path: Path) -> Path:
        """
        Ejecuta LibreOffice en modo headless para recalcular el archivo.

        Importante:
        - No guardamos en el mismo directorio que el de entrada para evitar
          el "Overwriting + impl_store failed".
        - Creamos un subdirectorio 'calc_out' y allí esperamos el archivo
          recalculado con el mismo nombre que el original.
        """
        input_path = workbook_path
        outdir = workbook_path.parent / "calc_out"
        outdir.mkdir(parents=True, exist_ok=True)

        cmd = [
            "soffice",
            "--headless",
            "--convert-to", "xlsx",
            "--outdir", str(outdir),
            str(input_path),
        ]

        print("[LibreOffice] Running:", " ".join(cmd))
        res = subprocess.run(cmd, capture_output=True, text=True)
        print("[LibreOffice] rc:", res.returncode)
        if res.stdout:
            print("[LibreOffice] stdout:", res.stdout)
        if res.stderr:
            print("[LibreOffice] stderr:", res.stderr)

        if res.returncode != 0:
            raise RuntimeError(f"LibreOffice convert failed with code {res.returncode}")

        # LibreOffice genera un archivo con el mismo nombre que el input, en 'outdir'
        output_path = outdir / input_path.name
        if not output_path.exists():
            raise FileNotFoundError(
                f"No se encontró archivo convertido por LibreOffice en {outdir}. "
                f"Esperaba: {output_path}"
            )

        print("[LibreOffice] Using recalculated workbook:", output_path)
        return output_path

    def run(self) -> Dict[str, Any]:
        """
        Flujo completo:
        1) Escribir input.
        2) Recalcular con LibreOffice (nuevo archivo en calc_out).
        3) Leer resultados desde el archivo recalculado.
        """
        original_path = Path(self.input_writer.write_input(self.payload))
        recalculated_path = self._run_libreoffice_calc(original_path)
        output_reader = ExcelOutputReader()
        data = output_reader.read_outputs(recalculated_path)
        data["excelPath"] = str(recalculated_path)
        return data
