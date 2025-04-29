import { FullService } from './../../app/portarias/full/full.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SlimService } from '../../app/portarias/slim/slim.service';
import { ZabbixService } from '../../app/zabbix/zabbix.service';

@Injectable()
export class VerifyRamaisService {
  constructor(
    private readonly zabbixService: ZabbixService,
    private readonly slimService: SlimService,
    private readonly fullService: FullService,
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

  @Cron('*/3 * * * *')
  async verifyAllRamaisOffSlim() {
    const allRamais = await this.slimService.getSlimStatus();

    await Promise.all(
      this.serverFront.map(async (server) => {
        await Promise.all(
          allRamais.map(async (status) => {
            try {
              const existItem = await this.zabbixService.verifyItem(
                status.resource,
                server.hostZabbixSlim,
                server.server,
              );

              if (existItem.result.length > 0) {
                const validTrigger =
                  await this.zabbixService.verifyTriggerToItem(
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
                } else if (status.state !== 'online') {
                  await Promise.all([
                    this.zabbixService.createTrigger(
                      status.resource,
                      server.server,
                      'ASTERISK',
                    ),
                    this.zabbixService.createTrigger(
                      status.resource,
                      server.serverBack,
                      'ASTERISK',
                    ),
                  ]);
                }
              } else {
                await Promise.all([
                  this.zabbixService.createItem(
                    status.resource,
                    server.hostZabbixSlim,
                    server.server,
                  ),
                  this.zabbixService.createTrigger(
                    status.resource,
                    server.server,
                    'ASTERISK',
                  ),
                  ...(status.state !== 'online'
                    ? [
                        this.zabbixService.createTrigger(
                          status.resource,
                          server.serverBack,
                          'ASTERISK',
                        ),
                      ]
                    : []),
                ]);
              }
            } catch (err) {
              console.error(
                `Erro ao processar ramal ${status.resource} (SLIM) no servidor ${server.server}:`,
                err,
              );
            }
          }),
        );
      }),
    );
  }

  @Cron('*/4 * * * *')
  async verifyAllRamaisOffFull() {
    const allRamais = await this.fullService.getFullStatus();

    await Promise.all(
      this.serverFront.map(async (server) => {
        await Promise.all(
          allRamais.map(async (status) => {
            try {
              const existItem = await this.zabbixService.verifyItem(
                status.resource,
                server.hostZabbixFull,
                server.server,
              );

              if (existItem.result.length > 0) {
                const validTrigger =
                  await this.zabbixService.verifyTriggerToItem(
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
                } else if (status.state !== 'online') {
                  await Promise.all([
                    this.zabbixService.createTrigger(
                      status.resource,
                      server.server,
                      'RAMAIS-PORTARIA-FULL',
                    ),
                    this.zabbixService.sendAlertErrorFull(
                      status.resource,
                      server.serverBack,
                    ),
                  ]);
                }
              } else {
                await Promise.all([
                  this.zabbixService.createItem(
                    status.resource,
                    server.hostZabbixFull,
                    server.server,
                  ),
                  this.zabbixService.createTrigger(
                    status.resource,
                    server.server,
                    'RAMAIS-PORTARIA-FULL',
                  ),
                  ...(status.state !== 'online'
                    ? [
                        this.zabbixService.sendAlertErrorFull(
                          status.resource,
                          server.serverBack,
                        ),
                      ]
                    : []),
                ]);
              }
            } catch (err) {
              console.error(
                `Erro ao processar ramal ${status.resource} (FULL) no servidor ${server.server}:`,
                err,
              );
            }
          }),
        );
      }),
    );
  }
}
