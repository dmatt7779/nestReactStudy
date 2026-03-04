import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoModule } from './project-info/project-info.module';
import { ProyeccionMacroModule } from './proyeccion-macro/proyeccion-macro.module';
import { CostosGastosModule } from './costos-gastos/costos-gastos.module';
import { PlanFinancieroModule } from './plan-financiero/plan-financiero.module';
import { SalarioAdminsModule } from './salario-admins/salario-admins.module';
import { ActivosFijosModule } from './activos-fijos/activos-fijos.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectSummaryModule } from './project-summary/project-summary.module';
import { FinancialResultsModule } from './financial-results/financial-results.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        connectionLimit: 50
      }
    }),
    ProjectInfoModule,
    ProyeccionMacroModule,
    CostosGastosModule,
    PlanFinancieroModule,
    SalarioAdminsModule,
    ActivosFijosModule,
    UsersModule,
    AuthModule,
    ProjectSummaryModule,
    FinancialResultsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}