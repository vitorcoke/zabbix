import { VerifyRamaisModule } from './schedules/ramais/verify-ramais.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SlimModule } from './app/portarias/slim/slim.module';
import { ZabbixModule } from './app/zabbix/zabbix.module';
import { FullModule } from './app/portarias/full/full.module';

@Module({
  imports: [
    VerifyRamaisModule,
    ScheduleModule.forRoot(),
    SlimModule,
    FullModule,
    ZabbixModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
