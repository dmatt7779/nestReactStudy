import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoModule } from './project-info/project-info.module';
import { ProjectInfo } from './project-info/entities/project-info.entity';
import { ProyeccionMacro } from './proyeccion-macro/entities/proyeccion-macro.entity';
import { CostosGasto } from './costos-gastos/entities/costos-gasto.entity';
import { PlanFinanciero } from './plan-financiero/entities/plan-financiero.entity';
import { ActivoFijo } from './activos-fijos/entities/activos-fijo.entity';
import { EstrategiaMarketing } from './proyeccion-macro/entities/estrategia-marketing.entity';
import { Producto } from './proyeccion-macro/entities/producto.entity';
import { User } from './users/entities/user.entity';
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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3307,
      username: 'user_crud',
      password: 'root',
      database: 'db_magic',
      // entities: [ProjectInfo, ProyeccionMacro, CostosGasto, PlanFinanciero, ActivoFijo, User, EstrategiaMarketing, Producto],
      autoLoadEntities: true,
      synchronize: true
    }),
    // CorsModule.forRoot({
    //   origin: [process.env.CORS_ORIGIN],
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //   credentials: true,
    //   allowedHeaders: 'Content-Type, Accept, Authorization',
    // }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
