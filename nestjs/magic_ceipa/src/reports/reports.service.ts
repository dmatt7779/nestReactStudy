import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FinancialResult } from '../financial-results/entities/financial-result.entity';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { User } from '../users/entities/user.entity';
import * as PDFDocument from 'pdfkit';
import {
  addSectionTitle,
  addComment,
  drawSimpleTable,
  drawIndicatorWithFormula,
  drawFlujoCajaTable,
  drawIndicatorBox,
  fmtCurrency,
  fmtPercent,
} from './pdf-helpers';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FinancialResult)
    private readonly financialResultRepo: Repository<FinancialResult>,
    @InjectRepository(ProjectInfo)
    private readonly projectInfoRepo: Repository<ProjectInfo>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateReport(projectInfoId: number): Promise<Buffer> {
    // 1. Fetch data
    const project = await this.projectInfoRepo.findOne({ where: { id: projectInfoId } });
    if (!project) throw new NotFoundException('Project not found');

    const financialResult = await this.financialResultRepo.findOne({ where: { projectInfoId } });
    if (!financialResult) throw new NotFoundException('Financial results not found for this project');

    // Resolve professor names
    let professorNames: string[] = [];
    if (project.professor && project.professor.length > 0) {
      const professorIds = project.professor.map(id => Number(id));
      const professors = await this.userRepo.find({ where: { id: In(professorIds) } });
      professorNames = professors.map(p => p.name);
    }

    const result: any = financialResult.result || {};
    const comments: any = financialResult.comments || {};
    const openingYear = project.openingYear;
    const anios = Array.from({ length: 5 }, (_, i) => openingYear + i);

    // 2. Generate PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ═══════════════════ PORTADA ═══════════════════
      doc.moveDown(6);
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a237e')
        .text('INFORME EVALUACIÓN DE PROYECTOS', { align: 'center' });
      doc.fontSize(18).fillColor('#e65100')
        .text('MAGIC', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).font('Helvetica').fillColor('#333');
      doc.text(`Nombre del Proyecto: ${project.projectName}`, { align: 'center' });
      doc.moveDown(1);
      doc.text(`Año Base: ${openingYear}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).font('Helvetica-Bold').text('INTEGRANTES', { align: 'center' });
      doc.fontSize(11).font('Helvetica');
      if (project.teamMembers && project.teamMembers.length > 0) {
        project.teamMembers.forEach(member => {
          doc.text(`${member.name} — CC ${member.id}`, { align: 'center' });
        });
      }
      doc.moveDown(1);

      doc.fontSize(14).font('Helvetica-Bold').text('PROFESOR(ES)', { align: 'center' });
      doc.fontSize(11).font('Helvetica');
      professorNames.forEach(name => doc.text(name, { align: 'center' }));
      doc.moveDown(1);

      // ═══════════════════ SECCIONES ═══════════════════

      // --- ESTADO DE RESULTADOS ---
      doc.addPage();
      addSectionTitle(doc, '1. ESTADO DE RESULTADOS');
      const erConceptos = [
        { label: 'Ventas', key: 'ventas' },
        { label: 'Costos de ventas', key: 'costosVentas' },
        { label: 'Utilidad bruta', key: 'utilidadBruta', bold: true },
        { label: 'Gastos operativos', key: 'gastosOperativos' },
        { label: 'Utilidad antes impuestos e intereses', key: 'utilidadAntesImpInt', bold: true },
        { label: 'Gastos financieros', key: 'gastosFinancieros' },
        { label: 'Ingresos financieros', key: 'ingresosFinancieros' },
        { label: 'Utilidad antes de impuestos', key: 'utilidadAntesImp', bold: true },
        { label: 'Impuestos', key: 'impuestos' },
        { label: 'Utilidad neta', key: 'utilidadNeta', bold: true },
      ];
      drawSimpleTable(doc, anios, erConceptos, result.estadoResultados);
      addComment(doc, comments.estadoResultados);

      // --- FLUJO DE EFECTIVO ---
      doc.addPage();
      addSectionTitle(doc, '2. FLUJO DE EFECTIVO');
      const feSection = result.flujoEfectivo || {};
      const feYears = [`Inicio ${openingYear}`, ...anios]; // 6 columns

      // Helper: normalize arrays to 6 elements for the 6-column layout
      const fePad6 = (v: any): any => {
        if (v == null) return v;
        if (!Array.isArray(v)) return [v, null, null, null, null, null];
        if (v.length === 4) return [null, null, ...v];
        if (v.length === 5) return [null, ...v];
        return v;
      };

      // ── Actividad de Operación ──
      doc.x = 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Actividad de Operación:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const feOp = feSection.actividadOperacion || {};
      const feOpData = {
        ventasContado: fePad6(feOp.ventasContado),
        recuperacionCartera: fePad6(feOp.recuperacionCartera),
        costosOperativos: fePad6(feOp.costosOperativos),
        gastosOperativos: fePad6(feOp.gastosOperativos),
        pagoProveedores: fePad6(feOp.pagoProveedores),
        inversionInventarioInicial: fePad6(feOp.inversionInventarioInicial),
        flujoEfectivoImpuestos: fePad6(feOp.flujoEfectivoImpuestos),
        depreciacionAmortizacion: fePad6(feSection.actividadFinanciacion?.depreciacionAmortizacion),
      };
      const feOpConceptos = [
        { label: 'Ventas de contado', key: 'ventasContado' },
        { label: 'Recuperación de cartera', key: 'recuperacionCartera' },
        { label: 'Costos operativos', key: 'costosOperativos' },
        { label: 'Gastos operativos', key: 'gastosOperativos' },
        { label: 'Pago de proveedores', key: 'pagoProveedores' },
        { label: 'Inversión en Inventario Inicial', key: 'inversionInventarioInicial' },
        { label: 'Impuestos', key: 'flujoEfectivoImpuestos' },
        { label: 'Depreciación y amortización ( - )', key: 'depreciacionAmortizacion' },
      ];
      drawSimpleTable(doc, feYears, feOpConceptos, feOpData);

      // ── Actividad de Financiación ──
      doc.x = 50;
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text('Actividad de Financiación:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const feFin = feSection.actividadFinanciacion || {};
      const feFinData = {
        capitalInicialSocios: fePad6(feFin.capitalInicialSocios),
        adquiPrestamos: fePad6(feFin.adquiPrestamos),
        feCapitalAdicionalSocios: fePad6(feFin.feCapitalAdicionalSocios),
        rendimientosFinancieros: fePad6(feFin.rendimientosFinancieros),
        servicioDeuda: fePad6(feFin.servicioDeuda),
        flujoEfectivoIntereses: fePad6(feFin.flujoEfectivoIntereses),
        flujoEfectivoDividendos: fePad6(feFin.flujoEfectivoDividendos),
      };
      const feFinConceptos = [
        { label: 'Aportes inicial de capital por Socios', key: 'capitalInicialSocios' },
        { label: 'Adquisición de préstamos', key: 'adquiPrestamos' },
        { label: 'Aporte ADICIONAL de capital por Socios', key: 'feCapitalAdicionalSocios' },
        { label: 'Rendimientos financieros', key: 'rendimientosFinancieros' },
        { label: 'Servicio de la deuda', key: 'servicioDeuda' },
        { label: 'Intereses', key: 'flujoEfectivoIntereses' },
        { label: 'Dividendos según el ejercicio anterior', key: 'flujoEfectivoDividendos' },
      ];
      drawSimpleTable(doc, feYears, feFinConceptos, feFinData);

      // ── Actividad de Inversión ──
      doc.x = 50;
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text('Actividad de Inversión:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const feInv = feSection.actividadInversion || {};
      const feInvData = {
        ventaActivosFijos: fePad6(feInv.ventaActivosFijos),
        inversionActivosFijos: fePad6(feInv.inversionActivosFijos),
      };
      const feInvConceptos = [
        { label: 'Venta de activos fijos', key: 'ventaActivosFijos' },
        { label: 'Inversión activos fijos', key: 'inversionActivosFijos' },
      ];
      drawSimpleTable(doc, feYears, feInvConceptos, feInvData);

      // ── Summary rows ──
      doc.x = 50;
      doc.moveDown(0.5);
      const feSummaryData = {
        excedenteDeficitEfectivo: feSection.excedenteDeficitEfectivo,
        aporteSocios: feSection.aporteSocios,
        flujoEfectivoSaldoInicial: feSection.flujoEfectivoSaldoInicial,
        flujoEfectivoSaldoFinal: feSection.flujoEfectivoSaldoFinal,
      };
      const feSummaryConceptos = [
        { label: 'Excedente o déficit efectivo', key: 'excedenteDeficitEfectivo', bold: true },
        { label: 'Decisión Junta Directiva (Aporte Socios)', key: 'aporteSocios' },
        { label: 'Saldo inicial', key: 'flujoEfectivoSaldoInicial' },
        { label: 'Saldo final de efectivo', key: 'flujoEfectivoSaldoFinal', bold: true },
      ];
      drawSimpleTable(doc, feYears, feSummaryConceptos, feSummaryData);
      addComment(doc, comments.flujoEfectivo);

      // --- ESTADO DE SITUACIÓN FINANCIERA ---
      doc.addPage();
      addSectionTitle(doc, '3. ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL)');
      const esfSection = result.EstadoSituacionFinanc || {};
      const esfYears = [`Inicio ${openingYear}`, ...anios]; // 6 columns

      // Helper: normalize arrays to 6 elements for the 6-column layout
      const pad6 = (v: any): any => {
        if (v == null) return v;
        if (!Array.isArray(v)) return [v, null, null, null, null, null]; // scalar → first col only
        if (v.length === 5) return [null, ...v]; // 5 elements → skip Inicio
        return v;
      };

      // ── Activos Corrientes ──
      doc.x = 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Activos:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const actCor = esfSection.activosCorrientes || {};
      const actCorData = {
        esfDisponible: pad6(actCor.esfDisponible),
        esfInversionesTemporales: pad6(actCor.esfInversionesTemporales),
        esfPorCobrar: pad6(actCor.esfPorCobrar),
        esfInventarios: pad6(actCor.esfInventarios),
        esfOtrosActivos: pad6(actCor.esfOtrosActivos),
        esfTotalActivosCorrientes: pad6(actCor.esfTotalActivosCorrientes),
      };
      const actCorConceptos = [
        { label: 'Disponible', key: 'esfDisponible' },
        { label: 'Inversiones temporales', key: 'esfInversionesTemporales' },
        { label: 'Deudores (cuentas por cobrar)', key: 'esfPorCobrar' },
        { label: 'Inventarios', key: 'esfInventarios' },
        { label: 'Otros activos', key: 'esfOtrosActivos' },
        { label: 'Total activo corriente', key: 'esfTotalActivosCorrientes', bold: true },
      ];
      drawSimpleTable(doc, esfYears, actCorConceptos, actCorData);

      // ── Activos de Largo Plazo ──
      doc.x = 50;
      doc.moveDown(0.5);
      const actLP = esfSection.activosLargoPlazo || {};
      const actLPData = {
        mueblesEnseres: pad6(actLP.mueblesEnseres),
        equipoMaquinaria: pad6(actLP.equipoMaquinaria),
        vehiculos: pad6(actLP.vehiculos),
        terrenos: pad6(actLP.terrenos),
        edificaciones: pad6(actLP.edificaciones),
        equiposComputo: pad6(actLP.equiposComputo),
        depreciacionAcumulada: pad6(actLP.depreciacionAcumulada),
        activosDiferidos: pad6(actLP.activosDiferidos),
        amortizacionAcumulada: pad6(actLP.amortizacionAcumulada),
        totalActivosNoCorrientes: pad6(actLP.totalActivosNoCorrientes),
      };
      const actLPConceptos = [
        { label: 'Muebles y enseres', key: 'mueblesEnseres' },
        { label: 'Maquinaria y equipo', key: 'equipoMaquinaria' },
        { label: 'Vehículos', key: 'vehiculos' },
        { label: 'Terrenos', key: 'terrenos' },
        { label: 'Edificaciones', key: 'edificaciones' },
        { label: 'Equipo de computación', key: 'equiposComputo' },
        { label: 'Depreciación acumulada', key: 'depreciacionAcumulada' },
        { label: 'Activos Diferidos', key: 'activosDiferidos' },
        { label: 'Amortización acumulada', key: 'amortizacionAcumulada' },
        { label: 'Total activos NO corrientes', key: 'totalActivosNoCorrientes', bold: true },
      ];
      drawSimpleTable(doc, esfYears, actLPConceptos, actLPData);

      // ── Total Activos ──
      doc.x = 50;
      doc.moveDown(0.3);
      drawSimpleTable(doc, esfYears, [
        { label: 'Total activos', key: 'totalActivos', bold: true },
      ], esfSection);

      // ── Pasivos Corrientes ──
      doc.addPage();
      doc.x = 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Pasivos:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const pasCor = esfSection.pasivosCorrientes || {};
      const pasCorData = {
        proveedores: pad6(pasCor.proveedores),
        impuestosPorPagar: pad6(pasCor.impuestosPorPagar),
        pagarSociosAno1: pad6(pasCor.pagarSociosAno1),
        pagarSocios: pad6(pasCor.pagarSocios),
        obligacionesFinancierasCor: pad6(pasCor.obligacionesFinancierasCor),
        totalPasivosCorrientes: pad6(pasCor.totalPasivosCorrientes),
      };
      const pasCorConceptos = [
        { label: 'Proveedores', key: 'proveedores' },
        { label: 'Impuesto por pagar', key: 'impuestosPorPagar' },
        { label: 'Cuenta por Pagar a Socios 1er año', key: 'pagarSociosAno1' },
        { label: 'Cuenta por Pagar a Socios', key: 'pagarSocios' },
        { label: 'Obligaciones financieras corrientes', key: 'obligacionesFinancierasCor' },
        { label: 'Total pasivos corrientes', key: 'totalPasivosCorrientes', bold: true },
      ];
      drawSimpleTable(doc, esfYears, pasCorConceptos, pasCorData);

      // ── Pasivos No Corrientes ──
      doc.x = 50;
      doc.moveDown(0.5);
      const pasNC = esfSection.pasivosNoCorrientes || {};
      const pasNCData = {
        obligacionesFinancierasNoCor: pad6(pasNC.obligacionesFinancierasNoCor),
        totalPasivosNoCorrientes: pad6(pasNC.totalPasivosNoCorrientes),
      };
      const pasNCConceptos = [
        { label: 'Obligaciones financieras no corrientes', key: 'obligacionesFinancierasNoCor' },
        { label: 'Total pasivos NO corrientes', key: 'totalPasivosNoCorrientes', bold: true },
      ];
      drawSimpleTable(doc, esfYears, pasNCConceptos, pasNCData);

      // ── Total Pasivos ──
      doc.x = 50;
      doc.moveDown(0.3);
      drawSimpleTable(doc, esfYears, [
        { label: 'Total pasivos', key: 'totalPasivos', bold: true },
      ], esfSection);

      // ── Patrimonio ──
      doc.x = 50;
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text('Patrimonio:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const patri = esfSection.patrimonio || {};
      const patriData = {
        capital: pad6(patri.capital),
        esfCapitalAdicionalSocios: pad6(patri.esfCapitalAdicionalSocios),
        utilidadPeriodo: pad6(patri.utilidadPeriodo),
        reservaLegal: pad6(patri.reservaLegal),
        utilidadRetenidas: pad6(patri.utilidadRetenidas),
        decisionJuntaDirectiva: pad6(esfSection.decisionJuntaDirectiva),
        totalPatrimonio: esfSection.totalPatrimonio,
      };
      const patriConceptos = [
        { label: 'Capital', key: 'capital' },
        { label: 'Capital adicional socios', key: 'esfCapitalAdicionalSocios' },
        { label: 'Utilidad del periodo', key: 'utilidadPeriodo' },
        { label: 'Reserva legal', key: 'reservaLegal' },
        { label: 'Utilidad retenidas', key: 'utilidadRetenidas' },
        { label: 'Decisión junta directiva', key: 'decisionJuntaDirectiva' },
        { label: 'Total patrimonio', key: 'totalPatrimonio', bold: true },
      ];
      drawSimpleTable(doc, esfYears, patriConceptos, patriData);

      // ── Total Pasivo y Patrimonio ──
      doc.x = 50;
      doc.moveDown(0.3);
      drawSimpleTable(doc, esfYears, [
        { label: 'Total pasivo y patrimonio', key: 'totalPasivosPatrimonio', bold: true },
      ], esfSection);

      addComment(doc, comments.estadoSituacionFinanc);

      // --- FLUJO DE CAJA ---
      doc.addPage();
      addSectionTitle(doc, '4. FLUJO DE CAJA — TIR Y VPN');
      const fcSection = result.flujoCaja || {};

      // ── Operating cash flow table ──
      const fcOperatingRows = [
        { label: 'Ventas', key: 'fujVentas' },
        { label: 'Costos', key: 'fujCostos' },
        { label: 'Gastos operativos', key: 'fujGastosOperativos' },
        { label: 'Utilidad operativa', key: 'fujUtilidadOperativa', bold: true },
        { label: 'Impuesto de renta operativo', key: 'fujImpRentaOperativo' },
        { label: 'Beneficio fiscal financiero', key: 'fujBeneficioFiscal' },
        { label: 'Utilidad operativa después de impuestos', key: 'fujUtilOperDespuesImpuesto', bold: true },
        { label: 'Depreciación y amortización', key: 'fujDepresiacionAmort' },
        { label: 'Flujo de caja bruto operativo', key: 'fujCajaBrutoOperativo', bold: true, hasExtraCol: true },
      ];
      drawFlujoCajaTable(doc, anios, fcOperatingRows, fcSection);

      // ── Indicadores del Proyecto ──
      doc.x = 50;
      doc.moveDown(0.5);
      drawIndicatorBox(doc, [
        { label: 'TIR del proyecto', value: fmtPercent(fcSection.tirProyecto), note: '▶ Mayor que la TMRR' },
        { label: 'TMRR o COK', value: fmtPercent(fcSection.tmrrCok), note: '▶ Tasa mínima de retorno requerida' },
        { label: 'TIR modificada del proyecto', value: fmtPercent(fcSection.tirModificado), note: '▶ Mayor a la TMRR' },
        { label: 'VPN del proyecto (TMRR)', value: fmtCurrency(fcSection.vpnProyectoTmrr), note: '▶ Mayor a cero' },
      ]);

      // ── Investor cash flow table ──
      doc.x = 50;
      doc.moveDown(0.5);
      const fcInvestorRows = [
        { label: 'Capital neto de trabajo (KTNO)', key: 'capitalNetoKtno' },
        { label: 'Escudo fiscal', key: 'escudoFiscal' },
        { label: 'Servicio de la deuda', key: 'fujServicioDeuda' },
        { label: 'Gastos financieros', key: 'fujGastosFinancieros' },
        { label: 'Aporte inicial de socios', key: 'fujAportInicialSocios' },
        { label: 'Aporte adicional de socios', key: 'fujAporteAdicionalSocios' },
        { label: 'Cuenta por pagar a socios', key: 'fujCuentaPagarSocios' },
        { label: 'Flujo de caja libre inversionista', key: 'flujoCajaLibreInver', bold: true, hasExtraCol: true },
      ];
      drawFlujoCajaTable(doc, anios, fcInvestorRows, fcSection);

      // ── TIR del Inversionista ──
      doc.x = 50;
      doc.moveDown(0.5);
      drawIndicatorBox(doc, [
        { label: 'TIR del inversionista', value: fmtPercent(fcSection.tirInversionista) },
        { label: 'TMRR', value: fmtPercent(fcSection.fujTmrr) },
        { label: 'TIR modificada del inversionista', value: fmtPercent(fcSection.fujTirModificadaInver) },
        { label: 'VPN', value: fmtCurrency(fcSection.fujVpn) },
      ]);

      // ── Punto de equilibrio ──
      if (fcSection.puntoEquilibrio) {
        doc.x = 50;
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('Punto de Equilibrio:', 50, doc.y, { underline: true });
        doc.moveDown(0.3);
        const pe = fcSection.puntoEquilibrio;
        const peRows = [
          { label: 'En unidades (Anual)', key: 'unidadesAnual' },
          { label: 'En unidades (Mensual)', key: 'unidadesMensual' },
          { label: 'En pesos (Anual)', key: 'pesosAnual' },
          { label: 'En pesos (Mensual)', key: 'pesosMensual' },
        ];
        const startX = 50;
        const labelW = 256;
        const valW = 256;
        const rowH = 22;
        const padding = 6;

        // Header
        doc.fontSize(8).font('Helvetica-Bold');
        doc.rect(startX, doc.y, 512, rowH).fill('#e65100');
        const hdrY = doc.y + padding;
        doc.fillColor('#fff');
        doc.text('Punto de Equilibrio', startX + 4, hdrY, { width: labelW - 8 });
        doc.text(String(openingYear), startX + labelW + 4, hdrY, { width: valW - 8, align: 'right' });
        doc.y = hdrY + rowH - padding;

        peRows.forEach((row, idx) => {
          const y = doc.y;
          const bg = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
          doc.rect(startX, y, 512, rowH).fill(bg);
          doc.fillColor('#333').font('Helvetica').fontSize(8);
          doc.text(row.label, startX + 4, y + padding, { width: labelW - 8 });
          doc.text(fmtCurrency(pe[row.key]), startX + labelW + 4, y + padding, { width: valW - 8, align: 'right' });
          doc.y = y + rowH;
        });
      }
      addComment(doc, comments.flujoCaja);

      // --- WACC ---
      doc.addPage();
      addSectionTitle(doc, '5. WACC — COSTO PROMEDIO PONDERADO DE CAPITAL');
      const waccSection = result.wacc || {};
      const waccConceptos = [
        { label: 'Proveedores', key: 'waccProveedores' },
        { label: 'Impuesto por pagar', key: 'waccImpPagar' },
        { label: 'Obligaciones financieras corrientes', key: 'waccOblFinanCorrientes' },
        { label: 'Obligaciones financieras NO corrientes', key: 'waccOblFinanNoCorrientes' },
        { label: 'Patrimonio', key: 'waccPatrimonio' },
        { label: 'Total pasivo y patrimonio', key: 'waccTotalPasivoPatrimonio', bold: true },
      ];
      drawSimpleTable(doc, anios, waccConceptos, waccSection);

      // Participación
      if (waccSection.participacion) {
        doc.x = 50;
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('Participación (%):', 50, doc.y, { underline: true });
        doc.moveDown(0.3);
        const partConceptos = [
          { label: 'Proveedores', key: 'waccPartProveedores' },
          { label: 'Impuesto por pagar', key: 'waccImpPorPagar' },
          { label: 'Obligaciones financieras corrientes', key: 'waccPartOblFinanCorrientes' },
          { label: 'Obligaciones financieras NO corrientes', key: 'waccPartOblFinanNoCorrientes' },
          { label: 'Patrimonio', key: 'waccPartPatrimonio' },
          { label: 'Costo promedio ponderado', key: 'waccCostoPromPonderado', bold: true },
        ];
        drawSimpleTable(doc, anios, partConceptos, waccSection.participacion, 'percent');

        // Media Aritmética del Costo Promedio Ponderado
        const costoArr = waccSection.participacion.waccCostoPromPonderado;
        if (Array.isArray(costoArr)) {
          const validValues = costoArr.filter((v: any) => v != null && !isNaN(v));
          if (validValues.length > 0) {
            const media = validValues.reduce((sum: number, v: number) => sum + v, 0) / validValues.length;
            doc.x = 50;
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a237e')
              .text('Media Aritmética del Costo Promedio Ponderado:', 50, doc.y);
            doc.moveDown(0.3);
            drawIndicatorBox(doc, [
              { label: 'Costo promedio ponderado', value: fmtPercent(media) },
            ]);
          }
        }
      }
      addComment(doc, comments.wacc);

      // --- INDICADORES FINANCIEROS (Liquidez & Endeudamiento) ---
      doc.addPage();
      addSectionTitle(doc, '6. INDICADORES FINANCIEROS');

      // Liquidez
      doc.x = 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Indicadores de Liquidez y Actividad:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const liqData = result.indLiquidez || {};
      const liqRows = [
        { label: 'Razón Corriente', formula: 'Activo corriente / Pasivo corriente', path: liqData?.razonCorriente?.ilActPasCorriente, format: 'decimal' },
        { label: 'Solidez', formula: 'Activo total / Pasivo total', path: liqData?.solidez?.ilActPasTotal, format: 'decimal' },
        { label: 'Capital de Trabajo', formula: 'Activo corriente - Pasivo CTE', path: liqData?.capitalTrabajo?.ilActCtePasCte, format: 'currency' },
      ];
      drawIndicatorWithFormula(doc, anios, liqRows, 'Liquidez');

      // Endeudamiento 
      doc.x = 50;
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica-Bold').text('Indicadores de Endeudamiento:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const endData = result.indEndeudamiento || {};
      const endRows = [
        { label: 'Índice de endeudamiento', formula: 'Pasivo total / Activo total', path: endData?.endeudamiento?.endActPasTotal, format: 'percent' },
        { label: 'Endeudamiento a corto plazo', formula: 'Pasivo corriente / (Pasivo total + Activo total)', path: endData?.endCortoPlazo?.endPasCtePasTotal, format: 'percent' },
        { label: 'Patrimonio a pasivos', formula: 'Patrimonio / Pasivo total', path: endData?.patrimonioAPasivos?.endPatriPasTotal, format: 'decimal' },
      ];
      drawIndicatorWithFormula(doc, anios, endRows, 'Endeudamiento');
      addComment(doc, comments.indiFinancieros);

      // --- INDICADORES (Rentabilidad & Generación de Valor) ---
      doc.addPage();
      addSectionTitle(doc, '7. INDICADORES DE RENTABILIDAD Y GENERACIÓN DE VALOR');

      // Rentabilidad
      doc.x = 50;
      doc.fontSize(10).font('Helvetica-Bold').text('De Rentabilidad:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const renData = result.indRentabilidad || {};
      const renRows = [
        { label: 'Margen Bruto', formula: 'Resultado Bruto / Ventas', path: renData?.margenBruto?.resultBrutoVentas, format: 'percent' },
        { label: 'Margen Operacional', formula: 'Resultado Operacional / Ventas', path: renData?.margenOperacional?.resultOperacionalVentas, format: 'percent' },
        { label: 'Margen Neto de Utilidad', formula: 'Resultado del ejercicio / Ventas', path: renData?.margenNetoUtilidad?.resultEjercicioVentas, format: 'percent' },
        { label: 'Rendimiento del Patrimonio', formula: 'Resultado del ejercicio / Patrimonio', path: renData?.rendPatrimonio?.resultEjercicioPatri, format: 'percent' },
        { label: 'Rendimiento del Activo', formula: 'Resultado del ejercicio / Activo Total', path: renData?.rendDelActivo?.resultEjercicioActivoTotal, format: 'percent' },
      ];
      drawIndicatorWithFormula(doc, anios, renRows, 'Indicadores de Rentabilidad');

      // Generación de Valor
      doc.x = 50;
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica-Bold').text('De Generación de Valor:', 50, doc.y, { underline: true });
      doc.moveDown(0.3);
      const valData = result.indGeneracionValor || {};
      const valRows = [
        { label: 'KTNO', formula: 'C x C + Inventarios - C x P', path: valData?.ktno?.ccInventariosCp, format: 'currency' },
        { label: 'PKT', formula: 'KTNO / Ingresos', path: valData?.pkt?.ktnoIngresos, format: 'percent' },
        { label: 'ROA (Rendimiento Activo)', formula: 'UAII / Activos Netos Operativos', path: valData?.roa?.uaiiActNetosOper, format: 'percent' },
        { label: 'ROI (Rendimiento Patrimonio)', formula: 'UAI / Patrimonio', path: valData?.roi?.uaiPatrimonio, format: 'percent' },
        { label: 'Margen EBITDA', formula: 'EBITDA / Ingresos', path: valData?.margenEbitda?.ebitdaIngresos, format: 'percent' },
        { label: 'Costo Promedio Ponderado', formula: '—', path: valData?.costoPromPonderado?.costPromedioPonderado, format: 'percent' },
        { label: 'RAN', formula: 'UODI / Activos de Operación', path: valData?.ran?.uodiActOper, format: 'percent' },
        { label: 'EVA', formula: 'UODI - Activos x CK', path: valData?.eva?.uodiActivosCk, format: 'currency' },
        { label: 'EVA', formula: 'Activos x (RAN - CK)', path: valData?.eva2?.activosRanCk, format: 'currency' },
        { label: '% EVA', formula: 'EVA / Ventas', path: valData?.porcentEva?.evaVentas, format: 'percent' },
      ];
      drawIndicatorWithFormula(doc, anios, valRows, 'Indicadores de Valor');
      addComment(doc, comments.indicadores);

      doc.end();
    });
  }
}
