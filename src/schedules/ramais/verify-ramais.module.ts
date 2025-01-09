import { Module } from '@nestjs/common';
import { VerifyRamaisService } from './verify-ramais.service';
import { ZabbixModule } from '../../app/zabbix/zabbix.module';
import { SlimModule } from '../../app/portarias/slim/slim.module';
import { FullModule } from 'src/app/portarias/full/full.module';

@Module({
  imports: [ZabbixModule, SlimModule, FullModule],
  providers: [VerifyRamaisService],
})
export class VerifyRamaisModule {}
