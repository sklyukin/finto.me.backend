import app from '../../server/server';
import EmailService from '../../server/services/email/emailService';
import sinon from 'sinon';

let should = require('chai').should();

describe('EmailService', () => {
  let Email = app.models.Email;

  before(() => {
    sinon.stub(Email, 'send');
  });

  it('Should call Email.send', () => {
    EmailService.send({
      'to': 'test@test.com',
      'html': 'just a test'
    });
    Email.send.calledOnce.should.equal(true);
  });
});
