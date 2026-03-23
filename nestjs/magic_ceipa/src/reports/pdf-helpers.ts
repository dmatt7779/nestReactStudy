// ═══════════════════════════════════════════════════════════════
//  PDF Drawing & Formatting Helpers
//  Extracted from ReportsService for maintainability.
//  All functions are pure — they only need the PDFKit doc instance.
// ═══════════════════════════════════════════════════════════════

// ─── Formatting ───────────────────────────────────────────────

export function fmtCurrency(value: any): string {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

export function fmtPercent(value: any): string {
  if (value == null || isNaN(value)) return '';
  const pct = value * 100;
  return `${pct.toFixed(2)}%`;
}

export function fmtDecimal(value: any): string {
  if (value == null || isNaN(value)) return '';
  return Number(value).toFixed(2);
}

// ─── Section Title & Comment ──────────────────────────────────

export function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a237e').text(title);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#e65100').lineWidth(2).stroke();
  doc.moveDown(0.5);
  doc.fillColor('#333');
}

export function addComment(doc: PDFKit.PDFDocument, comment: string | undefined) {
  doc.x = 50;
  doc.moveDown(0.8);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a237e').text('Análisis e Interpretación:', 50);
  doc.fontSize(9).font('Helvetica').fillColor('#333');
  if (comment && comment.trim()) {
    doc.text(comment, 50, doc.y, { width: 512 });
  } else {
    doc.fillColor('#999').font('Helvetica-Oblique').text('Sin comentarios registrados.', 50);
    doc.fillColor('#333');
  }
}

// ─── Simple Table (WACC, Estado de Resultados, etc.) ──────────

export function drawSimpleTable(
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
  const headerHeight = 22;
  const cellPadding = 6;

  // Header
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
  doc.rect(startX, doc.y, 512, headerHeight).fill('#1a237e');
  const headerY = doc.y + cellPadding;
  doc.fillColor('#fff');
  doc.text('Concepto', startX + 4, headerY, { width: colWidth - 8, continued: false });
  years.forEach((year, i) => {
    doc.text(String(year), startX + colWidth * (i + 1) + 4, headerY, { width: colWidth - 8, align: 'right' });
  });
  doc.y = headerY + headerHeight - cellPadding;

  // Data rows
  rows.forEach((row, idx) => {
    const y = doc.y;

    doc.font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    const textHeight = doc.heightOfString(row.label, { width: colWidth - 8 });
    const rowHeight = Math.max(22, textHeight + cellPadding * 2);

    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
    }
    const drawY = doc.y;

    const bgColor = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
    doc.rect(startX, drawY, 512, rowHeight).fill(bgColor);

    doc.fillColor('#333').font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    doc.text(row.label, startX + 4, drawY + cellPadding, { width: colWidth - 8 });

    const values = data[row.key];
    if (Array.isArray(values)) {
      values.forEach((val: any, i: number) => {
        const formatted = defaultFormat === 'percent' ? fmtPercent(val) : fmtCurrency(val);
        doc.text(formatted, startX + colWidth * (i + 1) + 4, drawY + cellPadding, { width: colWidth - 8, align: 'right' });
      });
    }
    doc.y = drawY + rowHeight;
  });
}

// ─── Indicator Rows (unused after refactor but kept for compat) ─

export function drawIndicatorRows(
  doc: PDFKit.PDFDocument,
  years: (string | number)[],
  rows: { label: string; path: any; format?: string }[],
) {
  const startX = 50;
  const colWidth = 512 / (years.length + 1);
  const headerHeight = 20;
  const cellPadding = 5;

  // Header
  doc.fontSize(7).font('Helvetica-Bold');
  doc.rect(startX, doc.y, 512, headerHeight).fill('#e8eaf6');
  const headerY = doc.y + cellPadding;
  doc.fillColor('#1a237e');
  doc.text('Indicador', startX + 4, headerY, { width: colWidth - 8 });
  years.forEach((year, i) => {
    doc.text(String(year), startX + colWidth * (i + 1) + 4, headerY, { width: colWidth - 8, align: 'right' });
  });
  doc.y = headerY + headerHeight - cellPadding;

  rows.forEach((row, idx) => {
    const y = doc.y;

    doc.font('Helvetica').fontSize(7);
    const textHeight = doc.heightOfString(row.label, { width: colWidth - 8 });
    const rowHeight = Math.max(20, textHeight + cellPadding * 2);

    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
    }
    const drawY = doc.y;

    const bgColor = idx % 2 === 0 ? '#fafafa' : '#ffffff';
    doc.rect(startX, drawY, 512, rowHeight).fill(bgColor);

    doc.fillColor('#333').font('Helvetica').fontSize(7);
    doc.text(row.label, startX + 4, drawY + cellPadding, { width: colWidth - 8 });

    if (Array.isArray(row.path)) {
      row.path.forEach((val: any, i: number) => {
        const fmt = row.format === 'percent' ? fmtPercent(val) :
                    row.format === 'currency' ? fmtCurrency(val) :
                    fmtDecimal(val);
        doc.text(fmt, startX + colWidth * (i + 1) + 4, drawY + cellPadding, { width: colWidth - 8, align: 'right' });
      });
    }
    doc.y = drawY + rowHeight;
  });
}

// ─── Indicator Table with Formula Column ──────────────────────

export function drawIndicatorWithFormula(
  doc: PDFKit.PDFDocument,
  years: (string | number)[],
  rows: { label: string; formula: string; path: any; format?: string }[],
  headerTitle: string,
) {
  const startX = 50;
  const totalWidth = 512;
  const labelW = 100;
  const formulaW = 100;
  const yearColW = (totalWidth - labelW - formulaW) / years.length;
  const headerHeight = 20;
  const cellPadding = 5;

  // Header
  doc.fontSize(7).font('Helvetica-Bold');
  doc.rect(startX, doc.y, totalWidth, headerHeight).fill('#1a237e');
  const headerY = doc.y + cellPadding;
  doc.fillColor('#fff');
  doc.text(headerTitle, startX + 4, headerY, { width: labelW - 8 });
  doc.text('Fórmula de cálculo', startX + labelW + 4, headerY, { width: formulaW - 8 });
  years.forEach((year, i) => {
    doc.text(String(year), startX + labelW + formulaW + yearColW * i + 4, headerY, { width: yearColW - 8, align: 'right' });
  });
  doc.y = headerY + headerHeight - cellPadding;

  rows.forEach((row, idx) => {
    const y = doc.y;
    doc.font('Helvetica').fontSize(7);
    const textHeight = Math.max(
      doc.heightOfString(row.label, { width: labelW - 8 }),
      doc.heightOfString(row.formula, { width: formulaW - 8 }),
    );
    const rowHeight = Math.max(20, textHeight + cellPadding * 2);

    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
    }
    const drawY = doc.y;

    const bgColor = idx % 2 === 0 ? '#fafafa' : '#ffffff';
    doc.rect(startX, drawY, totalWidth, rowHeight).fill(bgColor);

    doc.fillColor('#333').font('Helvetica-Bold').fontSize(7);
    doc.text(row.label, startX + 4, drawY + cellPadding, { width: labelW - 8 });
    doc.fillColor('#666').font('Helvetica-Oblique').fontSize(6);
    doc.text(row.formula, startX + labelW + 4, drawY + cellPadding, { width: formulaW - 8 });

    if (Array.isArray(row.path)) {
      doc.fillColor('#333').font('Helvetica-Bold').fontSize(7);
      row.path.forEach((val: any, i: number) => {
        const fmt = row.format === 'percent' ? fmtPercent(val) :
                    row.format === 'currency' ? fmtCurrency(val) :
                    fmtDecimal(val);
        doc.text(fmt, startX + labelW + formulaW + yearColW * i + 4, drawY + cellPadding, { width: yearColW - 8, align: 'right' });
      });
    }
    doc.y = drawY + rowHeight;
  });
}

// ─── Flujo de Caja Table (variable-length arrays) ─────────────

export function drawFlujoCajaTable(
  doc: PDFKit.PDFDocument,
  years: (string | number)[],
  rows: { label: string; key: string; bold?: boolean; hasExtraCol?: boolean }[],
  data: any,
) {
  if (!data) return;

  const startX = 50;
  const totalCols = years.length + 1;
  const colWidth = 512 / totalCols;
  const headerHeight = 22;
  const cellPadding = 6;

  // Header
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
  doc.rect(startX, doc.y, 512, headerHeight).fill('#1a237e');
  const headerY = doc.y + cellPadding;
  doc.fillColor('#fff');
  doc.text('Concepto', startX + 4, headerY, { width: colWidth - 8 });
  years.forEach((year, i) => {
    doc.text(String(year), startX + colWidth * (i + 1) + 4, headerY, { width: colWidth - 8, align: 'right' });
  });
  doc.y = headerY + headerHeight - cellPadding;

  // Data rows
  rows.forEach((row, idx) => {
    const y = doc.y;
    doc.font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    const textHeight = doc.heightOfString(row.label, { width: colWidth - 8 });
    const rowHeight = Math.max(22, textHeight + cellPadding * 2);

    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
    }
    const drawY = doc.y;

    const bgColor = row.bold ? '#e8eaf6' : (idx % 2 === 0 ? '#f5f5f5' : '#ffffff');
    doc.rect(startX, drawY, 512, rowHeight).fill(bgColor);

    doc.fillColor('#333').font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    doc.text(row.label, startX + 4, drawY + cellPadding, { width: colWidth - 8 });

    const rawData = data[row.key];

    if (Array.isArray(rawData)) {
      const len = rawData.length;

      if (row.hasExtraCol && len >= 6) {
        years.forEach((_, ci) => {
          const val = rawData[ci + 1];
          doc.text(
            val != null ? fmtCurrency(val) : '',
            startX + colWidth * (ci + 1) + 4, drawY + cellPadding,
            { width: colWidth - 8, align: 'right' },
          );
        });
      } else if (len >= 5) {
        years.forEach((_, ci) => {
          const val = rawData[ci];
          doc.text(
            val != null ? fmtCurrency(val) : '',
            startX + colWidth * (ci + 1) + 4, drawY + cellPadding,
            { width: colWidth - 8, align: 'right' },
          );
        });
      } else if (len === 4) {
        years.forEach((_, ci) => {
          if (ci === 0) return;
          const val = rawData[ci - 1];
          doc.text(
            val != null ? fmtCurrency(val) : '',
            startX + colWidth * (ci + 1) + 4, drawY + cellPadding,
            { width: colWidth - 8, align: 'right' },
          );
        });
      }
    } else if (rawData != null && !isNaN(rawData)) {
      doc.text(
        fmtCurrency(rawData),
        startX + colWidth * 1 + 4, drawY + cellPadding,
        { width: colWidth - 8, align: 'right' },
      );
    }

    doc.y = drawY + rowHeight;
  });
}

// ─── Indicator Box (TIR/VPN summary) ──────────────────────────

export function drawIndicatorBox(
  doc: PDFKit.PDFDocument,
  items: { label: string; value: string; note?: string }[],
) {
  const startX = 50;
  const totalWidth = 512;
  const hasNotes = items.some(i => i.note);
  const cellPadding = 5;
  const headerHeight = 20;
  const dataRowHeight = 20;

  if (hasNotes) {
    const labelW = 180;
    const valueW = 100;
    const noteW = totalWidth - labelW - valueW;

    items.forEach((item, idx) => {
      const y = doc.y;
      if (y + headerHeight > doc.page.height - 60) doc.addPage();
      const drawY = doc.y;

      doc.rect(startX, drawY, labelW, headerHeight).fill('#1a237e');
      doc.fillColor('#fff').font('Helvetica-Bold').fontSize(7);
      doc.text(item.label, startX + 4, drawY + cellPadding, { width: labelW - 8 });

      const bgVal = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
      doc.rect(startX + labelW, drawY, valueW, headerHeight).fill(bgVal);
      doc.fillColor('#333').font('Helvetica').fontSize(7);
      doc.text(item.value, startX + labelW + 4, drawY + cellPadding, { width: valueW - 8, align: 'right' });

      doc.rect(startX + labelW + valueW, drawY, noteW, headerHeight).fill(bgVal);
      doc.fillColor('#666').font('Helvetica-Oblique').fontSize(7);
      doc.text(item.note || '', startX + labelW + valueW + 4, drawY + cellPadding, { width: noteW - 8 });

      doc.y = drawY + headerHeight;
    });
  } else {
    const itemWidth = totalWidth / items.length;

    const hdrY = doc.y;
    doc.rect(startX, hdrY, totalWidth, headerHeight).fill('#1a237e');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(7);
    items.forEach((item, i) => {
      doc.text(item.label, startX + itemWidth * i + 4, hdrY + cellPadding, { width: itemWidth - 8, align: 'center' });
    });
    doc.y = hdrY + headerHeight;

    const valY = doc.y;
    doc.rect(startX, valY, totalWidth, dataRowHeight).fill('#f5f5f5');
    doc.fillColor('#333').font('Helvetica').fontSize(7);
    items.forEach((item, i) => {
      doc.text(item.value, startX + itemWidth * i + 4, valY + cellPadding, { width: itemWidth - 8, align: 'center' });
    });
    doc.y = valY + dataRowHeight;
  }
}
