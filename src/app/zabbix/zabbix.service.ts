import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { exec } from 'child_process';

@Injectable()
export class ZabbixService {
  private host = 'http://192.168.3.10';
  private endpoint = 'api_jsonrpc.php';

  async auth() {
    const url = `${this.host}/${this.endpoint}`;
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

  async verifyItem(item: string) {
    const url = `${this.host}/${this.endpoint}`;
    const auth = await this.auth();
    const data = {
      jsonrpc: '2.0',
      method: 'item.get',
      params: {
        output: ['name'],
        search: {
          key_: `ramal.${item}`,
        },
      },
      auth: auth.result,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async getItem(item: string) {
    const url = `${this.host}/${this.endpoint}`;
    const auth = await this.auth();
    const data = {
      jsonrpc: '2.0',
      method: 'item.get',
      params: {
        output: ['name'],
        search: {
          key_: `ramal.${item}`,
        },
      },
      auth: auth.result,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.result[0].itemid;
  }

  async verifyTriggerToItem(item: string) {
    const url = `${this.host}/${this.endpoint}`;
    const auth = await this.auth();

    const itemId = await this.getItem(item);
    const data = {
      jsonrpc: '2.0',
      method: 'trigger.get',
      params: {
        itemids: itemId,
      },
      auth: auth.result,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async createTrigger(item: string) {
    const url = `${this.host}/${this.endpoint}`;
    const auth = await this.auth();

    const data = {
      jsonrpc: '2.0',
      method: 'trigger.create',
      params: {
        description: `Trigger para Ramal ${item}`,
        expression: `last(/ASTERISK/ramal.${item})="Problema"`,
        priority: 5,
        status: 0,
      },
      auth: auth.result,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async createItem(item: string) {
    const url = `${this.host}/${this.endpoint}`;
    const auth = await this.auth();
    const data = {
      jsonrpc: '2.0',
      method: 'item.create',
      params: {
        name: `Ramal ${item}`,
        key_: `ramal.${item}`,
        hostid: '13610',
        type: 2,
        value_type: 4,
        interfaceid: '0',
        delay: 0,
        history: '90d',
        trends: 0,
      },
      auth: auth.result,
      id: 1,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async sendAlertError(item: string) {
    exec(
      `zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "Problema"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} -
            zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "Problema"`,
        );
        console.log(`${stderr} -
            zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "Problema"`);
      },
    );
  }

  async sendAlertSucesso(item: string) {
    exec(
      `zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "OK"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `${stdout} zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "OK"`,
        );
        console.log(
          `${stderr} zabbix_sender -z 192.168.3.10 -s "ASTERISK" -k ramal.${item} -o "OK"`,
        );
      },
    );
  }
}
