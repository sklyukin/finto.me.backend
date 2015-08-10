import _ from 'lodash';

let app = require('../server');
let Email = app.models().Email;

class EmailService {
  static send(customParams) {
    return new Promise((resolve, reject) => {
      if (!customParams.to) throw 'parameter "TO" required for sendEmail';

      let params = {
        from: 'no-reply-finance@klyukin.net',
        subject: 'Finance Notify Update'
      };

      _.assign(params, customParams);
      Email.send(params, (err, mail) => {
        if (err) return reject(err);
        console.log('successfully send email');
        return resolve(mail);
      });
    });
  }
}

export default EmailService;
