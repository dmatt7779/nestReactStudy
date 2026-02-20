import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

// ── Estado de Resultados ───────────────────────────────

class EstadoResultadosDto {
  @IsArray() @IsNumber({}, { each: true })
  ventas: number[];

  @IsArray() @IsNumber({}, { each: true })
  costosVentas: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadBruta: number[];

  @IsArray() @IsNumber({}, { each: true })
  gastosOperativos: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadAntesImpInt: number[];

  @IsArray() @IsNumber({}, { each: true })
  gastosFinancieros: number[];

  @IsArray() @IsNumber({}, { each: true })
  ingresosFinancieros: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadAntesImp: number[];

  @IsArray() @IsNumber({}, { each: true })
  impuestos: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadNeta: number[];
}

// ── Flujo de Efectivo ──────────────────────────────────

class ActividadOperacionDto {
  @IsArray() @IsNumber({}, { each: true })
  ventasContado: number[];

  @IsArray() @IsNumber({}, { each: true })
  recuperacionCartera: number[];

  @IsArray() @IsNumber({}, { each: true })
  costosOperativos: number[];

  @IsArray() @IsNumber({}, { each: true })
  gastosOperativos: number[];

  @IsArray() @IsNumber({}, { each: true })
  pagoProveedores: number[];

  @IsNumber()
  inversionInventarioInicial: number;

  @IsArray() @IsNumber({}, { each: true })
  flujoEfectivoImpuestos: number[];
}

class ActividadFinanciacionDto {
  @IsArray() @IsNumber({}, { each: true })
  depreciacionAmortizacion: number[];

  @IsNumber()
  capitalInicialSocios: number;

  @IsNumber()
  adquiPrestamos: number;

  @IsArray() @IsNumber({}, { each: true })
  feCapitalAdicionalSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  rendimientosFinancieros: number[];

  @IsArray() @IsNumber({}, { each: true })
  servicioDeuda: number[];

  @IsArray() @IsNumber({}, { each: true })
  flujoEfectivoIntereses: number[];

  @IsArray() @IsNumber({}, { each: true })
  flujoEfectivoDividendos: number[];
}

class ActividadInversionDto {
  @IsNumber()
  ventaActivosFijos: number;

  @IsArray() @IsNumber({}, { each: true })
  inversionActivosFijos: number[];
}

class FlujoEfectivoDto {
  @ValidateNested() @Type(() => ActividadOperacionDto)
  actividadOperacion: ActividadOperacionDto;

  @ValidateNested() @Type(() => ActividadFinanciacionDto)
  actividadFinanciacion: ActividadFinanciacionDto;

  @ValidateNested() @Type(() => ActividadInversionDto)
  actividadInversion: ActividadInversionDto;

  @IsArray() @IsNumber({}, { each: true })
  excedenteDeficitEfectivo: number[];

  @IsArray() @IsNumber({}, { each: true })
  aporteSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  flujoEfectivoSaldoInicial: number[];

  @IsArray() @IsNumber({}, { each: true })
  flujoEfectivoSaldoFinal: number[];
}

// ── Estado de Situación Financiera ─────────────────────

class ActivosCorrientesDto {
  @IsArray() @IsNumber({}, { each: true })
  esfDisponible: number[];

  @IsArray() @IsNumber({}, { each: true })
  esfInversionesTemporales: number[];

  @IsArray() @IsNumber({}, { each: true })
  esfPorCobrar: number[];

  @IsArray() @IsNumber({}, { each: true })
  esfInventarios: number[];

  @IsNumber()
  esfOtrosActivos: number;

  @IsArray() @IsNumber({}, { each: true })
  esfTotalActivosCorrientes: number[];
}

class ActivosLargoPlazoDto {
  @IsArray() @IsNumber({}, { each: true })
  mueblesEnseres: number[];

  @IsArray() @IsNumber({}, { each: true })
  equipoMaquinaria: number[];

  @IsArray() @IsNumber({}, { each: true })
  vehiculos: number[];

  @IsArray() @IsNumber({}, { each: true })
  terrenos: number[];

  @IsArray() @IsNumber({}, { each: true })
  edificaciones: number[];

  @IsArray() @IsNumber({}, { each: true })
  equiposComputo: number[];

  @IsArray() @IsNumber({}, { each: true })
  depreciacionAcumulada: number[];

  @IsArray() @IsNumber({}, { each: true })
  activosDiferidos: number[];

  @IsArray() @IsNumber({}, { each: true })
  amortizacionAcumulada: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalActivosNoCorrientes: number[];
}

class PasivosCorrientesDto {
  @IsArray() @IsNumber({}, { each: true })
  proveedores: number[];

  @IsArray() @IsNumber({}, { each: true })
  impuestosPorPagar: number[];

  @IsNumber()
  pagarSociosAno1: number;

  @IsArray() @IsNumber({}, { each: true })
  pagarSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  obligacionesFinancierasCor: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalPasivosCorrientes: number[];
}

class PasivosNoCorrientesDto {
  @IsArray() @IsNumber({}, { each: true })
  obligacionesFinancierasNoCor: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalPasivosNoCorrientes: number[];
}

class PatrimonioDto {
  @IsArray() @IsNumber({}, { each: true })
  capital: number[];

  @IsArray() @IsNumber({}, { each: true })
  esfCapitalAdicionalSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  reservaLegal: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadRetenidas: number[];

  @IsArray() @IsNumber({}, { each: true })
  utilidadPeriodo: number[];
}

class EstadoSituacionFinancDto {
  @ValidateNested() @Type(() => ActivosCorrientesDto)
  activosCorrientes: ActivosCorrientesDto;

  @ValidateNested() @Type(() => ActivosLargoPlazoDto)
  activosLargoPlazo: ActivosLargoPlazoDto;

  @ValidateNested() @Type(() => PasivosCorrientesDto)
  pasivosCorrientes: PasivosCorrientesDto;

  @ValidateNested() @Type(() => PasivosNoCorrientesDto)
  pasivosNoCorrientes: PasivosNoCorrientesDto;

  @ValidateNested() @Type(() => PatrimonioDto)
  patrimonio: PatrimonioDto;

  @IsArray() @IsNumber({}, { each: true })
  totalActivos: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalPasivos: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalPatrimonio: number[];

  @IsArray() @IsNumber({}, { each: true })
  totalPasivosPatrimonio: number[];

  @IsArray() @IsNumber({}, { each: true })
  decisionJuntaDirectiva: number[];
}

// ── Flujo de Caja ──────────────────────────────────────

class FlujoCajaDto {
  @IsArray() @IsNumber({}, { each: true })
  fujVentas: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujCostos: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujGastosOperativos: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujUtilidadOperativa: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujImpRentaOperativo: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujBeneficioFiscal: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujUtilOperDespuesImpuesto: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujDepresiacionAmort: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujCajaBrutoOperativo: number[];

  @IsOptional()
  tirProyecto: string | number;

  @IsNumber()
  tmrrCok: number;

  @IsOptional()
  tirModificado: string | number;

  @IsNumber()
  vpnProyectoTmrr: number;

  @IsArray() @IsNumber({}, { each: true })
  capitalNetoKtno: number[];

  @IsArray() @IsNumber({}, { each: true })
  escudoFiscal: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujServicioDeuda: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujGastosFinancieros: number[];

  @IsNumber()
  fujAportInicialSocios: number;

  @IsArray() @IsNumber({}, { each: true })
  fujAporteAdicionalSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  fujCuentaPagarSocios: number[];

  @IsArray() @IsNumber({}, { each: true })
  flujoCajaLibreInver: number[];

  @IsOptional()
  tirInversionista: string | number;

  @IsNumber()
  fujTmrr: number;

  @IsOptional()
  fujTirModificadaInver: string | number;

  @IsNumber()
  fujVpn: number;
}

// ── WACC ───────────────────────────────────────────────

class WaccParticipacionDto {
  @IsArray() @IsNumber({}, { each: true })
  waccPartProveedores: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccImpPorPagar: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccPartOblFinanCorrientes: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccPartOblFinanNoCorrientes: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccPartPatrimonio: number[];

  @IsArray()
  waccCostoPromPonderado: (number | null)[];
}

class WaccDto {
  @IsArray() @IsNumber({}, { each: true })
  waccProveedores: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccImpPagar: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccOblFinanCorrientes: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccOblFinanNoCorrientes: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccPatrimonio: number[];

  @IsArray() @IsNumber({}, { each: true })
  waccTotalPasivoPatrimonio: number[];

  @ValidateNested() @Type(() => WaccParticipacionDto)
  participacion: WaccParticipacionDto;
}

// ── Indicadores de Liquidez ────────────────────────────

class IndValoresDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ilActPasCorriente?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ilActPasTotal?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ilActCtePasCte?: number[];
}

class IndLiquidezDto {
  @ValidateNested() @Type(() => IndValoresDto)
  razonCorriente: IndValoresDto;

  @ValidateNested() @Type(() => IndValoresDto)
  solidez: IndValoresDto;

  @ValidateNested() @Type(() => IndValoresDto)
  capitalTrabajo: IndValoresDto;
}

// ── Indicadores de Endeudamiento ───────────────────────

class EndValoresDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  endActPasTotal?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  endPasCtePasTotal?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  endPatriPasTotal?: number[];
}

class IndEndeudamientoDto {
  @ValidateNested() @Type(() => EndValoresDto)
  endeudamiento: EndValoresDto;

  @ValidateNested() @Type(() => EndValoresDto)
  endCortoPlazo: EndValoresDto;

  @ValidateNested() @Type(() => EndValoresDto)
  patrimonioAPasivos: EndValoresDto;
}

// ── Indicadores de Rentabilidad ────────────────────────

class RentMargenBrutoDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  resultBrutoVentas?: number[];
}

class RentMargenOperacionalDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  resultOperacionalVentas?: number[];
}

class RentMargenNetoDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  resultEjercicioVentas?: number[];
}

class RentRendPatrimonioDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  resultEjercicioPatri?: number[];
}

class RentRendActivoDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  resultEjercicioActivoTotal?: number[];
}

class IndRentabilidadDto {
  @ValidateNested() @Type(() => RentMargenBrutoDto)
  margenBruto: RentMargenBrutoDto;

  @ValidateNested() @Type(() => RentMargenOperacionalDto)
  margenOperacional: RentMargenOperacionalDto;

  @ValidateNested() @Type(() => RentMargenNetoDto)
  margenNetoUtilidad: RentMargenNetoDto;

  @ValidateNested() @Type(() => RentRendPatrimonioDto)
  rendPatrimonio: RentRendPatrimonioDto;

  @ValidateNested() @Type(() => RentRendActivoDto)
  rendDelActivo: RentRendActivoDto;
}

// ── Indicadores de Generación de Valor ─────────────────

class GenValoresDto {
  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ccInventariosCp?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ktnoIngresos?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  uaiiActNetosOper?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  uaiPatrimonio?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  ebitdaIngresos?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  costPromedioPonderado?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  uodiActOper?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  uodiActivosCk?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  activosRanCk?: number[];

  @IsOptional() @IsArray() @IsNumber({}, { each: true })
  evaVentas?: number[];
}

class IndGeneracionValorDto {
  @ValidateNested() @Type(() => GenValoresDto)
  ktno: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  pkt: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  roa: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  roi: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  margenEbitda: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  costoPromPonderado: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  ran: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  eva: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  eva2: GenValoresDto;

  @ValidateNested() @Type(() => GenValoresDto)
  porcentEva: GenValoresDto;
}

// ── Result (contenido dentro de "result") ──────────────

class FinancialResultDataDto {
  @ValidateNested() @Type(() => EstadoResultadosDto)
  estadoResultados: EstadoResultadosDto;

  @ValidateNested() @Type(() => FlujoEfectivoDto)
  flujoEfectivo: FlujoEfectivoDto;

  @ValidateNested() @Type(() => EstadoSituacionFinancDto)
  EstadoSituacionFinanc: EstadoSituacionFinancDto;

  @ValidateNested() @Type(() => FlujoCajaDto)
  flujoCaja: FlujoCajaDto;

  @ValidateNested() @Type(() => WaccDto)
  wacc: WaccDto;

  @ValidateNested() @Type(() => IndLiquidezDto)
  indLiquidez: IndLiquidezDto;

  @ValidateNested() @Type(() => IndEndeudamientoDto)
  indEndeudamiento: IndEndeudamientoDto;

  @ValidateNested() @Type(() => IndRentabilidadDto)
  indRentabilidad: IndRentabilidadDto;

  @ValidateNested() @Type(() => IndGeneracionValorDto)
  indGeneracionValor: IndGeneracionValorDto;

  @IsOptional()
  @IsString()
  excelPath?: string;
}

// ── DTO principal ──────────────────────────────────────

export class CreateFinancialResultDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FinancialResultDataDto)
  result: FinancialResultDataDto;
}
