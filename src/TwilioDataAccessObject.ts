import * as assert from 'assert';
import { DataSource, SendOptions } from './types';

export class TwilioDataAccessObject {
  dataSource: DataSource;
  name = 'TwilioDAO';
  send: (options: { type: string; to: string; from: string; body: string; url: string }) => void;
  constructor(parentContext: DataSource) {
    this.dataSource = parentContext;
    this.send = (options: SendOptions) => {
      assert(this.dataSource !== undefined, 'datasource cannot be undefined!');
      const connector = this.dataSource.connector;
      assert(connector, 'Cannot use this module without a connector!');
      switch (options.type) {
        case 'sms':
          return connector.twilio.messages.create(options);
        case 'call':
          return connector.twilio.calls.create(options);
        default:
          return assert(false, `twilio message type: ${options.type} - not supported`);
      }
    };
  }
}
