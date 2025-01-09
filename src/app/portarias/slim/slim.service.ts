import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlimService {
  async getSlimStatus() {
    const host = 'http://192.168.1.213';
    const port = '8088';
    const username = 'username';
    const password = 'mind2023';
    const url = `${host}:${port}/ari/endpoints`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
    });

    return response.data.filter((data) => {
      return data.technology === 'SIP';
    });
  }
}
