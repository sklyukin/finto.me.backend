import request from 'request';

export class SmsRuService {
  static send(to, message) {
    new Promise((resolve, reject) => {
      let app = require('../../server');
      let api_id = app.get('sms.ru').api_id;
      let text = encodeURIComponent(message);
      let url =`http://sms.ru/sms/send?api_id=${api_id}&to=${to}&text=${text}`;
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          console.log('sms error occured', error);
          reject(error || response.statusCode);
        }
      })
    });
  }
}
