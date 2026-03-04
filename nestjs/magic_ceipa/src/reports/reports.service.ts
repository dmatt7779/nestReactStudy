import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FinancialResult } from '../financial-results/entities/financial-result.entity';
import { ProjectInfo } from '../project-info/entities/project-info.entity';
import { User } from '../users/entities/user.entity';
import * as PDFDocument from 'pdfkit';

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
      this.addSectionTitle(doc, '1. ESTADO DE RESULTADOS');
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
      this.drawSimpleTable(doc, anios, erConceptos, result.estadoResultados);
      this.addComment(doc, comments.estadoResultados);

      // --- FLUJO DE EFECTIVO ---
      doc.addPage();
      this.addSectionTitle(doc, '2. FLUJO DE EFECTIVO');
      const feConceptos = [
        { label: 'Actividades de operación', key: 'actividadesOperacion' },
        { label: 'Actividades de inversión', key: 'actividadesInversion' },
        { label: 'Actividades de financiación', key: 'actividadesFinanciacion' },
        { label: 'Flujo neto de efectivo', key: 'flujoNetoEfectivo', bold: true },
        { label: 'Saldo inicial de efectivo', key: 'saldoInicialEfectivo' },
        { label: 'Saldo final de efectivo', key: 'saldoFinalEfectivo', bold: true },
      ];
      this.drawSimpleTable(doc, anios, feConceptos, result.flujoEfectivo);
      this.addComment(doc, comments.flujoEfectivo);

      // --- ESTADO DE SITUACIÓN FINANCIERA ---
      doc.addPage();
      this.addSectionTitle(doc, '3. ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL)');
      const esfSection = result.EstadoSituacionFinanc || {};
      const esfConceptos = [
        { label: 'Total activo corriente', key: 'totalActivos', bold: true },
        { label: 'Total pasivos', key: 'totalPasivos', bold: true },
        { label: 'Total patrimonio', key: 'totalPatrimonio', bold: true },
        { label: 'Total pasivo y patrimonio', key: 'totalPasivosPatrimonio', bold: true },
      ];
      this.drawSimpleTable(doc, [`Inicio ${openingYear}`, ...anios], esfConceptos, esfSection);
      this.addComment(doc, comments.estadoSituacionFinanc);

      // --- FLUJO DE CAJA ---
      doc.addPage();
      this.addSectionTitle(doc, '4. FLUJO DE CAJA — TIR Y VPN');
      const fcSection = result.flujoCaja || {};

      // TIR/VPN table
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text('Indicadores del Proyecto:', { underline: true });
      doc.font('Helvetica').fontSize(9);
      const tirFields = [
        { label: 'TIR del proyecto', key: 'tirProyecto', format: 'percent' },
        { label: 'TMRR o COK', key: 'tmrrCok', format: 'percent' },
        { label: 'TIR modificada del proyecto', key: 'tirModificado', format: 'percent' },
        { label: 'VPN del proyecto (TMRR)', key: 'vpnProyectoTmrr', format: 'currency' },
        { label: 'TIR del inversionista', key: 'tirInversionista', format: 'percent' },
        { label: 'VPN inversionista', key: 'fujVpn', format: 'currency' },
      ];
      tirFields.forEach(f => {
        const val = fcSection[f.key];
        const formatted = f.format === 'percent' ? this.fmtPercent(val) : this.fmtCurrency(val);
        doc.text(`  ${f.label}: ${formatted}`);
      });

      // Punto de equilibrio
      if (fcSection.puntoEquilibrio) {
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('Punto de Equilibrio:', { underline: true });
        doc.font('Helvetica').fontSize(9);
        const pe = fcSection.puntoEquilibrio;
        doc.text(`  En unidades (Anual): ${this.fmtCurrency(pe.unidadesAnual)}`);
        doc.text(`  En unidades (Mensual): ${this.fmtCurrency(pe.unidadesMensual)}`);
        doc.text(`  En pesos (Anual): ${this.fmtCurrency(pe.pesosAnual)}`);
        doc.text(`  En pesos (Mensual): ${this.fmtCurrency(pe.pesosMensual)}`);
      }
      this.addComment(doc, comments.flujoCaja);

      // --- WACC ---
      doc.addPage();
      this.addSectionTitle(doc, '5. WACC — COSTO PROMEDIO PONDERADO DE CAPITAL');
      const waccSection = result.wacc || {};
      const waccConceptos = [
        { label: 'Proveedores', key: 'waccProveedores' },
        { label: 'Impuesto por pagar', key: 'waccImpPagar' },
        { label: 'Obligaciones financieras corrientes', key: 'waccOblFinanCorrientes' },
        { label: 'Obligaciones financieras NO corrientes', key: 'waccOblFinanNoCorrientes' },
        { label: 'Patrimonio', key: 'waccPatrimonio' },
        { label: 'Total pasivo y patrimonio', key: 'waccTotalPasivoPatrimonio', bold: true },
      ];
      this.drawSimpleTable(doc, anios, waccConceptos, waccSection);

      // Participación
      if (waccSection.participacion) {
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('Participación (%):', { underline: true });
        const partConceptos = [
          { label: 'Costo promedio ponderado', key: 'waccCostoPromPonderado', bold: true },
        ];
        this.drawSimpleTable(doc, anios, partConceptos, waccSection.participacion, 'percent');
      }
      this.addComment(doc, comments.wacc);

      // --- INDICADORES FINANCIEROS (Liquidez & Endeudamiento) ---
      doc.addPage();
      this.addSectionTitle(doc, '6. INDICADORES FINANCIEROS');

      // Liquidez
      doc.fontSize(10).font('Helvetica-Bold').text('Indicadores de Liquidez y Actividad:', { underline: true });
      doc.moveDown(0.3);
      const liqData = result.indLiquidez || {};
      const liqRows = [
        { label: 'Razón Corriente', path: liqData?.razonCorriente?.ilActPasCorriente },
        { label: 'Solidez', path: liqData?.solidez?.ilActPasTotal },
        { label: 'Capital de Trabajo', path: liqData?.capitalTrabajo?.ilActCtePasCte, format: 'currency' },
      ];
      this.drawIndicatorRows(doc, anios, liqRows);

      // Endeudamiento 
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica-Bold').text('Indicadores de Endeudamiento:', { underline: true });
      doc.moveDown(0.3);
      const endData = result.indEndeudamiento || {};
      const endRows = [
        { label: 'Índice de endeudamiento', path: endData?.endeudamiento?.endActPasTotal, format: 'percent' },
        { label: 'Endeudamiento a corto plazo', path: endData?.endCortoPlazo?.endPasCtePasTotal, format: 'percent' },
        { label: 'Patrimonio a pasivos', path: endData?.patrimonioAPasivos?.endPatriPasTotal },
      ];
      this.drawIndicatorRows(doc, anios, endRows);
      this.addComment(doc, comments.indiFinancieros);

      // --- INDICADORES (Rentabilidad & Generación de Valor) ---
      doc.addPage();
      this.addSectionTitle(doc, '7. INDICADORES DE RENTABILIDAD Y GENERACIÓN DE VALOR');

      // Rentabilidad
      doc.fontSize(10).font('Helvetica-Bold').text('De Rentabilidad:', { underline: true });
      doc.moveDown(0.3);
      const renData = result.indRentabilidad || {};
      const renRows = [
        { label: 'Margen Bruto', path: renData?.margenBruto?.resultBrutoVentas, format: 'percent' },
        { label: 'Margen Operacional', path: renData?.margenOperacional?.resultOperacionalVentas, format: 'percent' },
        { label: 'Margen Neto de Utilidad', path: renData?.margenNetoUtilidad?.resultEjercicioVentas, format: 'percent' },
        { label: 'Rendimiento del Patrimonio', path: renData?.rendPatrimonio?.resultEjercicioPatri, format: 'percent' },
        { label: 'Rendimiento del Activo', path: renData?.rendDelActivo?.resultEjercicioActivoTotal, format: 'percent' },
      ];
      this.drawIndicatorRows(doc, anios, renRows);

      // Generación de Valor
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica-Bold').text('De Generación de Valor:', { underline: true });
      doc.moveDown(0.3);
      const valData = result.indGeneracionValor || {};
      const valRows = [
        { label: 'EBITDA', path: valData?.ebitda?.ebitdaVal, format: 'currency' },
        { label: 'Margen EBITDA', path: valData?.margenEbitda?.margenEbitdaVal, format: 'percent' },
        { label: 'PKTNO', path: valData?.pktno?.pktnoVal },
        { label: 'PDC (Palanca de crecimiento)', path: valData?.pdc?.pdcVal },
        { label: 'ROA', path: valData?.roa?.roaVal, format: 'percent' },
        { label: 'ROE', path: valData?.roe?.roeVal, format: 'percent' },
        { label: 'EVA', path: valData?.eva?.evaVal, format: 'currency' },
      ];
      this.drawIndicatorRows(doc, anios, valRows);
      this.addComment(doc, comments.indicadores);

      doc.end();
    });
  }

  // ═══════════════════ HELPER METHODS ═══════════════════

  private addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e').text(title);
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#e65100').lineWidth(2).stroke();
    doc.moveDown(0.5);
    doc.fillColor('#333');
  }

  private addComment(doc: PDFKit.PDFDocument, comment: string | undefined) {
    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a237e').text('Análisis e Interpretación:');
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    if (comment && comment.trim()) {
      doc.text(comment, { width: 512 });
    } else {
      doc.fillColor('#999').font('Helvetica-Oblique').text('Sin comentarios registrados.');
      doc.fillColor('#333');
    }
  }

  private drawSimpleTable(
    doc: PDFKit.PDFDocument,
    years: (string | number)[],
    rows: { label: string; key: string; bold?: boolean }[],
    data: any,
    defaultFormat: string = 'currency',
  ) {
    if (!data) {
      doc.fontSize(9).fillColor('#999').text('Datos no disponibles.');
      doc.fillColor('#333');
      return;
    }

    const startX = 50;
    const colWidth = 512 / (years.length + 1);
    const rowHeight = 18;

    // Header
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(startX, doc.y, 512, rowHeight).fill('#1a237e');
    const headerY = doc.y + 5;
    doc.fillColor('#fff');
    doc.text('Concepto', startX + 4, headerY, { width: colWidth - 8, continued: false });
    years.forEach((year, i) => {
      doc.text(String(year), startX + colWidth * (i + 1) + 4, headerY, { width: colWidth - 8, align: 'right' });
    });
    doc.y = headerY + rowHeight - 5;

    // Data rows
    rows.forEach((row, idx) => {
      const y = doc.y;
      const bgColor = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
      doc.rect(startX, y, 512, rowHeight).fill(bgColor);
      
      doc.fillColor('#333').font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
      doc.text(row.label, startX + 4, y + 5, { width: colWidth - 8 });
      
      const values = data[row.key];
      if (Array.isArray(values)) {
        values.forEach((val: any, i: number) => {
          const formatted = defaultFormat === 'percent' ? this.fmtPercent(val) : this.fmtCurrency(val);
          doc.text(formatted, startX + colWidth * (i + 1) + 4, y + 5, { width: colWidth - 8, align: 'right' });
        });
      }
      doc.y = y + rowHeight;
    });
  }

  private drawIndicatorRows(
    doc: PDFKit.PDFDocument,
    years: (string | number)[],
    rows: { label: string; path: any; format?: string }[],
  ) {
    const startX = 50;
    const colWidth = 512 / (years.length + 1);
    const rowHeight = 16;

    // Header
    doc.fontSize(7).font('Helvetica-Bold');
    doc.rect(startX, doc.y, 512, rowHeight).fill('#e8eaf6');
    const headerY = doc.y + 4;
    doc.fillColor('#1a237e');
    doc.text('Indicador', startX + 4, headerY, { width: colWidth - 8 });
    years.forEach((year, i) => {
      doc.text(String(year), startX + colWidth * (i + 1) + 4, headerY, { width: colWidth - 8, align: 'right' });
    });
    doc.y = headerY + rowHeight - 4;

    rows.forEach((row, idx) => {
      const y = doc.y;
      const bgColor = idx % 2 === 0 ? '#fafafa' : '#ffffff';
      doc.rect(startX, y, 512, rowHeight).fill(bgColor);
      
      doc.fillColor('#333').font('Helvetica').fontSize(7);
      doc.text(row.label, startX + 4, y + 4, { width: colWidth - 8 });
      
      if (Array.isArray(row.path)) {
        row.path.forEach((val: any, i: number) => {
          const fmt = row.format === 'percent' ? this.fmtPercent(val) : 
                      row.format === 'currency' ? this.fmtCurrency(val) : 
                      this.fmtDecimal(val);
          doc.text(fmt, startX + colWidth * (i + 1) + 4, y + 4, { width: colWidth - 8, align: 'right' });
        });
      }
      doc.y = y + rowHeight;
    });
  }

  private fmtCurrency(value: any): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }

  private fmtPercent(value: any): string {
    if (value == null || isNaN(value)) return '';
    const pct = value * 100;
    return `${pct.toFixed(2)}%`;
  }

  private fmtDecimal(value: any): string {
    if (value == null || isNaN(value)) return '';
    return Number(value).toFixed(2);
  }
}
