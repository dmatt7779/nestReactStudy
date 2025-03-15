import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInfoModule } from './project-info/project-info.module';
import { ProjectInfo } from './project-info/entities/project-info.entity';
import { ProyeccionMacroModule } from './proyeccion-macro/proyeccion-macro.module';
import { ProyeccionMacro } from './proyeccion-macro/entities/proyeccion-macro.entity';
import { CostosGastosModule } from './costos-gastos/costos-gastos.module';
import { CostosGasto } from './costos-gastos/entities/costos-gasto.entity';
import { PlanFinancieroModule } from './plan-financiero/plan-financiero.module';
import { PlanFinanciero } from './plan-financiero/entities/plan-financiero.entity';
import { SalarioAdminsModule } from './salario-admins/salario-admins.module';
import { ActivosFijosModule } from './activos-fijos/activos-fijos.module';
import { ActivoFijo } from './activos-fijos/entities/activos-fijo.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
// import { CorsModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3307,
      username: 'user_crud',
      password: 'root',
      database: 'db_crud',
      entities: [ProjectInfo, ProyeccionMacro, CostosGasto, PlanFinanciero, ActivoFijo, User],
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
