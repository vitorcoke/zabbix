import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FullService {
  async getFullStatus() {
    const url = 'http://ipvoicer-int.minhaportaria.com:8088/ipvoicer/ari/endpoints';
    const username = 'ctvoicer';
    const password = 'CTV@endpoints';


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
