import { Module } from '@nestjs/common';
import { RamaisModule } from './schedules/ramais/ramais.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AsteriskModule } from './app/asterisk/asterisk.module';
import { ZabbixModule } from './app/zabbix/zabbix.module';

@Module({
  imports: [
    RamaisModule,
    ScheduleModule.forRoot(),
    AsteriskModule,
    ZabbixModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
