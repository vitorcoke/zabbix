import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { exec } from 'child_process';

@Injectable()
export class ZabbixService {
  private endpoint = 'api_jsonrpc.php';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async auth(server: string) {
    const url = `${server}/${this.endpoint}`;
    const data = {
      jsonrpc: '2.0',
      method: 'user.login',
      params: {
        username: 'vitorcoke',
        password: '123@mudar',
      },
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async verifyItem(item: string, hostZabbix: string, server: string) {
    const url = `${server}/${this.endpoint}`;

    const value = await this.cacheManager.get(server);

    const data = {
      jsonrpc: '2.0',
      method: 'item.get',
      params: {
        output: ['name'],
        search: {
          key_: `ramal.${item}`,
        },
        hostids: [hostZabbix],
      },
      auth: value,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      const auth = await this.auth(server);

      this.cacheManager.set(server, auth.result).then(async (e) => {
        const response = await axios.post(
          url,
          { ...data, auth: e },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data;
      });
    }

    return response.data;
  }

  async getItem(item: string, server: string) {
    const url = `${server}/${this.endpoint}`;

    const value = await this.cacheManager.get(server);
    const data = {
      jsonrpc: '2.0',
      method: 'item.get',
      params: {
        output: ['name'],
        search: {
          key_: `ramal.${item}`,
        },
      },
      auth: value,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      const auth = await this.auth(server);

      this.cacheManager.set(server, auth.result).then(async (e) => {
        const response = await axios.post(
          url,
          { ...data, auth: e },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data.result[0].itemid;
      });
    }

    return response.data.result[0].itemid;
  }

  async verifyTriggerToItem(item: string, server: string) {
    const url = `${server}/${this.endpoint}`;

    const value = await this.cacheManager.get(server);
    const itemId = await this.getItem(item, server);
    const data = {
      jsonrpc: '2.0',
      method: 'trigger.get',
      params: {
        itemids: itemId,
      },
      auth: value,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      const auth = await this.auth(server);

      this.cacheManager.set(server, auth.result).then(async (e) => {
        const response = await axios.post(
          url,
          { ...data, auth: e },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data;
      });
    }

    return response.data;
  }

  async createTrigger(item: string, server: string, hostName: string) {
    const url = `${server}/${this.endpoint}`;

    const value = await this.cacheManager.get(server);
    const data = {
      jsonrpc: '2.0',
      method: 'trigger.create',
      params: {
        description: `Trigger para Ramal ${item}`,
        expression: `last(/${hostName}/ramal.${item})="Problema"`,
        priority: 5,
        status: 0,
      },
      auth: value,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      const auth = await this.auth(server);

      this.cacheManager.set(server, auth.result).then(async (e) => {
        const response = await axios.post(
          url,
          { ...data, auth: e },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data;
      });
    }

    return response.data;
  }

  async createItem(item: string, hostZabbix: string, server: string) {
    const url = `${server}/${this.endpoint}`;
    const value = await this.cacheManager.get(server);
    const data = {
      jsonrpc: '2.0',
      method: 'item.create',
      params: {
        name: `Ramal ${item}`,
        key_: `ramal.${item}`,
        hostid: hostZabbix,
        type: 2,
        value_type: 4,
        interfaceid: '0',
        delay: 0,
        history: '90d',
        trends: 0,
      },
      auth: value,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      const auth = await this.auth(server);

      this.cacheManager.set(server, auth.result).then(async (e) => {
        const response = await axios.post(
          url,
          { ...data, auth: e },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data;
      });
    }

    return response.data;
  }

  async sendAlertErrorSlim(item: string, server: string) {
    exec(
      `zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "Problema"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} -
            zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "Problema"`,
        );
        console.log(`${stderr} -
            zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "Problema"`);
      },
    );
  }

  async sendAlertSucessoSlim(item: string, server: string) {
    exec(
      `zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "OK"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "OK"`,
        );
        console.log(
          `${stderr} zabbix_sender -z ${server} -s "ASTERISK" -k ramal.${item} -o "OK"`,
        );
      },
    );
  }

  async sendAlertErrorFull(item: string, server: string) {
    exec(
      `zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "Problema"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} -
            zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "Problema"`,
        );
        console.log(`${stderr} -
            zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "Problema"`);
      },
    );
  }

  async sendAlertSucessoFull(item: string, server: string) {
    exec(
      `zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "OK"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "OK"`,
        );
        console.log(
          `${stderr} zabbix_sender -z ${server} -s "RAMAIS-PORTARIA-FULL" -k ramal.${item} -o "OK"`,
        );
      },
    );
  }
}
