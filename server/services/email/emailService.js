import _ from 'lodash';
import loopback from 'loopback';
import ejs from 'ejs';
import fs from 'fs';
import juice from 'juice';

let app = require('../../server');
let Email = app.models.Email;
const FROM_DOMAIN = app.get('email').fromDomain;

class EmailService {
  static send(customParams) {
    return new Promise((resolve, reject) => {
      if (!customParams.to) throw 'parameter "to" required for sendEmail';
      if (!customParams.html) throw 'parameter "html" required for sendEmail';
      let params = {
        from: `Finto.me <noreply@${FROM_DOMAIN}>`,
        subject: 'finto.me'
      };
      _.assign(params, customParams);
      let filename = `${__dirname}/views/boilerplate.ejs`;

      let tpl = fs.readFileSync(filename, 'utf8');
      let html = ejs.render(tpl, {
        html: params.html
      }, {
        filename
      });
      //inline css
      params.html = juice(html);
      Email.send(params, (err, mail) => {
        if (err) return reject(err);
        return resolve(mail);
      });
    });
  }
}

export default EmailService;
