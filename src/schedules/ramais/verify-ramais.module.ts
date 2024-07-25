import { Module } from '@nestjs/common';
import { VerifyRamaisService } from './verify-ramais.service';
import { ZabbixModule } from '../../app/zabbix/zabbix.module';
import { AsteriskModule } from '../../app/asterisk/asterisk.module';

@Module({
  imports: [ZabbixModule, AsteriskModule],
  providers: [VerifyRamaisService],
})
export class VerifyRamaisModule {}
