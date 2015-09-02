import app from '../../server/server';
import EmailService from '../../server/services/email/emailService';
import sinon from 'sinon';
import USERS from '../fixtures/users';

let should = require('chai').should();

describe('EmailService', () => {
  let Email = app.models.Email;
  let User = app.models.user;
  let user1 = new User(USERS.stan);

  before(() => {
    sinon.stub(Email, 'send', (params, cb) => cb());
  });

  it('Should call Email.send', () => {
    return EmailService.send({
      user: user1,
      html: 'just a test'
    }).then(() => {
      Email.send.calledOnce.should.equal(true);
    })
  });
});
