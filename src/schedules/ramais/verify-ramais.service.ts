import { FullService } from './../../app/portarias/full/full.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SlimService } from '../../app/portarias/slim/slim.service';
import { ZabbixService } from '../../app/zabbix/zabbix.service';

@Injectable()
export class VerifyRamaisService {
  constructor(
    private readonly zabbixService: ZabbixService,
    private readonly SlimService: SlimService,
    private readonly FullService: FullService
  ) { }

  @Cron('*/3 * * * *')
  async verifyAllRamaisOffSlim() {
    const allRamais = await this.SlimService.getSlimStatus();

    for (const status of allRamais) {
      const existItem = await this.zabbixService.verifyItem(status.resource, '16826');

      if (existItem.result.length > 0) {
        const validTrigger = await this.zabbixService.verifyTriggerToItem(
          status.resource,
        );

        if (validTrigger.result.length > 0) {
          if (status.state === 'online') {
            await this.zabbixService.sendAlertSucessoSlim(status.resource);
          } else {
            await this.zabbixService.sendAlertErrorSlim(status.resource);
          }
        } else {
          if (status.state !== 'online') {
            await this.zabbixService.createTrigger(status.resource, '16826', 'ASTERISK');
            await this.zabbixService.sendAlertErrorSlim(status.resource);
          }
        }
      } else {

        await this.zabbixService.createItem(status.resource, '16826');
        await this.zabbixService.createTrigger(status.resource, '16826', 'ASTERISK');
        if (status.state !== 'online') {
          await this.zabbixService.sendAlertErrorSlim(status.resource);
        }
      }
    }
  }

  async verifyAllRamaisOffFull() {
    const allRamais = await this.FullService.getFullStatus();

    for (const status of allRamais) {
      const existItem = await this.zabbixService.verifyItem(status.resource, "16906");

      if (existItem.result.length > 0) {
        const validTrigger = await this.zabbixService.verifyTriggerToItem(
          status.resource,
        );

        if (validTrigger.result.length > 0) {
          if (status.state === 'online') {
            await this.zabbixService.sendAlertSucessoFull(status.resource);
          } else {
            await this.zabbixService.sendAlertErrorFull(status.resource);
          }
        } else {
          if (status.state !== 'online') {
            await this.zabbixService.createTrigger(status.resource, '16906', 'RAMAIS-PORTARIA-FULL');
            await this.zabbixService.sendAlertErrorFull(status.resource);
          }
        }
      } else {
        await this.zabbixService.createItem(status.resource, '16906');
        await this.zabbixService.createTrigger(status.resource, '16906','RAMAIS-PORTARIA-FULL');
        if (status.state !== 'online') {
          await this.zabbixService.sendAlertErrorFull(status.resource);
        }
      }
    }
  }
}
