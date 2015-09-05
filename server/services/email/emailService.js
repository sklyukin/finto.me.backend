import _ from 'lodash';
import loopback from 'loopback';
import ejs from 'ejs';
import fs from 'fs';
import juice from 'juice';
import {AuthService} from '../../auth/AuthService';

let app = require('../../server');
let Email = app.models.Email;
let AccessToken = app.models.accessToken;
const FROM_DOMAIN = app.get('email').fromDomain;
const WEB_APP = app.get('webApp').url;
const APP_NAME = app.get('name');

class EmailService {
  static send(customParams) {
    return new Promise((resolve, reject) => {
      if (!customParams.user) throw 'parameter "user" is required for sendEmail';
      if (!customParams.user.email) throw 'parameter "user.email" is required for sendEmail';
      if (!customParams.html) throw 'parameter "html" is required for sendEmail';
      let params = {
        from: `${APP_NAME} <noreply@${FROM_DOMAIN}>`,
        subject: APP_NAME
      };
      _.assign(params, customParams);
      let user = customParams.user;
      params.to = user.email;
      user.createAccessToken().then((accessToken) => {
        let filename = `${__dirname}/views/boilerplate.ejs`;

        let tpl = fs.readFileSync(filename, 'utf8');
        let html = ejs.render(tpl, {
          APP_NAME: APP_NAME,
          html: params.html,
          homeLink: AuthService.WebAppLinkWithToken(accessToken)
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
    });
  }
}

export default EmailService;
