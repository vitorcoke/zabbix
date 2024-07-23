import { Module } from '@nestjs/common';
import { RamaisService } from './ramais.service';
import { ZabbixModule } from 'src/app/zabbix/zabbix.module';
import { AsteriskModule } from 'src/app/asterisk/asterisk.module';

@Module({
  imports: [ZabbixModule, AsteriskModule],
  providers: [RamaisService],
})
export class RamaisModule {}
