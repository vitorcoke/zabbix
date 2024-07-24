import { VerifyRamaisModule } from './schedules/ramais/verify-ramais.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AsteriskModule } from './app/asterisk/asterisk.module';
import { ZabbixModule } from './app/zabbix/zabbix.module';

@Module({
  imports: [
    VerifyRamaisModule,
    ScheduleModule.forRoot(),
    AsteriskModule,
    ZabbixModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
