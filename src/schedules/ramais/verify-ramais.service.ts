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
    private readonly FullService: FullService,
  ) {}

  private serverFront = [
    {
      server: '192.168.1.23',
      serverBack: '192.168.1.22',
      hostZabbixSlim: '19426',
      hostZabbixFull: '19854',
    },
    {
      server: '192.168.1.10',
      serverBack: '192.168.1.11',
      hostZabbixSlim: '16192',
      hostZabbixFull: '19086',
    },
  ];

  @Cron('* * * * *')
  async verifyAllRamaisOffSlim() {
    const allRamais = await this.SlimService.getSlimStatus();

    for (const server of this.serverFront) {
      for (const status of allRamais) {
        const existItem = await this.zabbixService.verifyItem(
          status.resource,
          server.hostZabbixSlim,
          server.server,
        );

        if (existItem.result.length > 0) {
          const validTrigger = await this.zabbixService.verifyTriggerToItem(
            status.resource,
            server.server,
          );

          if (validTrigger.result.length > 0) {
            if (status.state === 'online') {
              await this.zabbixService.sendAlertSucessoSlim(
                status.resource,
                server.serverBack,
              );
            } else {
              await this.zabbixService.sendAlertErrorSlim(
                status.resource,
                server.serverBack,
              );
            }
          } else {
            if (status.state !== 'online') {
              await this.zabbixService.createTrigger(
                status.resource,
                server.server,
                'ASTERISK',
              );

              await this.zabbixService.createTrigger(
                status.resource,
                server.serverBack,
                'ASTERISK',
              );
            }
          }
        } else {
          await this.zabbixService.createItem(
            status.resource,
            server.hostZabbixSlim,
            server.server,
          );
          await this.zabbixService.createTrigger(
            status.resource,
            server.server,
            'ASTERISK',
          );
          if (status.state !== 'online') {
            await this.zabbixService.createTrigger(
              status.resource,
              server.serverBack,
              'ASTERISK',
            );
          }
        }
      }
    }
  }

  @Cron('*/4 * * * *')
  async verifyAllRamaisOffFull() {
    const allRamais = await this.FullService.getFullStatus();

    for (const server of this.serverFront) {
      for (const status of allRamais) {
        const existItem = await this.zabbixService.verifyItem(
          status.resource,
          server.hostZabbixFull,
          server.server,
        );

        if (existItem.result.length > 0) {
          const validTrigger = await this.zabbixService.verifyTriggerToItem(
            status.resource,
            server.server,
          );

          if (validTrigger.result.length > 0) {
            if (status.state === 'online') {
              await this.zabbixService.sendAlertSucessoFull(
                status.resource,
                server.serverBack,
              );
            } else {
              await this.zabbixService.sendAlertErrorFull(
                status.resource,
                server.serverBack,
              );
            }
          } else {
            if (status.state !== 'online') {
              await this.zabbixService.createTrigger(
                status.resource,
                server.server,
                'RAMAIS-PORTARIA-FULL',
              );
              await this.zabbixService.sendAlertErrorFull(
                status.resource,
                server.serverBack,
              );
            }
          }
        } else {
          await this.zabbixService.createItem(
            status.resource,
            server.hostZabbixFull,
            server.server,
          );
          await this.zabbixService.createTrigger(
            status.resource,
            server.server,
            'RAMAIS-PORTARIA-FULL',
          );
          if (status.state !== 'online') {
            await this.zabbixService.sendAlertErrorFull(
              status.resource,
              server.serverBack,
            );
          }
        }
      }
    }
  }
}
