import * as assert from 'assert';
import { DataSource, SendOptions } from './types';
import { TwilioDataAccessObject } from './TwilioDataAccessObject';

export class TwilioConnector {
  DataAccessObject: TwilioDataAccessObject;
  name = 'TwilioConnector';
  accountSid: string;
  authToken: string;
  twilio: { messages: { create: (options: SendOptions) => void }; calls: { create: (options: SendOptions) => void } };
  dataSource: DataSource;
  constructor(settings: { accountSid: string; authToken: string }) {
    assert(typeof settings === 'object', 'cannot initialize Twilio_Connector without a settings object');

    this.accountSid = settings.accountSid;
    this.authToken = settings.authToken;
    this.twilio = require('twilio')(this.accountSid, this.authToken);
    this.DataAccessObject = new TwilioDataAccessObject({ connector: this });
  }
}
