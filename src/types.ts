import { TwilioConnector } from './TwilioConnector';

export type DataSource = {
  [x: string]: unknown;
  connector: TwilioConnector;
};

export type SendOptions = {
  type: string;
  to: string;
  from: string;
  body: string;
  url: string;
};
