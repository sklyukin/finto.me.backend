import _ from 'lodash';
import loopback from 'loopback';
import ejs from 'ejs';
import fs from 'fs';
import juice from 'juice';

let app = require('../../server');
let Email = app.models.Email;

class EmailService {
  static send(customParams) {
    return new Promise((resolve, reject) => {
      if (!customParams.to) throw 'parameter "to" required for sendEmail';
      if (!customParams.html) throw 'parameter "html" required for sendEmail';
      let params = {
        from: 'no-reply-finance@klyukin.net',
        subject: 'Finance Notify Update'
      };
      _.assign(params, customParams);
      let filename = `${__dirname}/views/boilerplate.ejs`;
      try {
        let tpl = fs.readFileSync(filename, 'utf8');
        let html = ejs.render(tpl, {
          html: params.html
        }, {
          filename
        });
        params.html = juice(html);
      } catch (e) {
        console.log('EmailService Error:', e);
        return;
      }
      Email.send(params, (err, mail) => {
        if (err) return reject(err);
        return resolve(mail);
      });
    });
  }
}

export default EmailService;
