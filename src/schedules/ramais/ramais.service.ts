import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AsteriskService } from 'src/app/asterisk/asterisk.service';
import { ZabbixService } from 'src/app/zabbix/zabbix.service';

@Injectable()
export class RamaisService {
  constructor(
    private readonly zabbixService: ZabbixService,
    private readonly asteriskService: AsteriskService,
  ) {}

  @Cron('*/5 * * * *')
  async verifyAllRamaisOff() {
    const allRamais = await this.asteriskService.getAsteriskStatus();

    allRamais.forEach(async (status) => {
      const existItem = await this.zabbixService.verifyItem(status.resource);

      if (existItem.result.length > 0) {
        const validTrigger = await this.zabbixService.verifyTriggerToItem(
          status.resource,
        );

        if (validTrigger.result.length > 0) {
          await this.zabbixService.sendAlert(status.resource);
        } else {
          await this.zabbixService.createTrigger(status.resource);
          await this.zabbixService.sendAlert(status.resource);
        }
      } else {
        await this.zabbixService.createItem(status.resource);
        await this.zabbixService.createTrigger(status.resource);
        await this.zabbixService.sendAlert(status.resource);
      }
    });
  }
}
