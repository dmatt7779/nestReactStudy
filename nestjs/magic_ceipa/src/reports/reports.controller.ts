import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/rol.enum';

@Controller('reports')
export class ReportsController {

  constructor(private readonly reportsService: ReportsService) {}

  @Get('project/:projectInfoId')
  @Auth(Role.USER, Role.PROFESSOR, Role.ADMIN)
  async generateReport(
    @Param('projectInfoId') projectInfoId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateReport(+projectInfoId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte_proyecto_${projectInfoId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
