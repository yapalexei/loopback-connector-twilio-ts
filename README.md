# Twilio Connector for Loopback 4
This (twilio) connector/integration was built because there was none that worked with Loopback 4 that didn't need tweaking. I do want to give credit to the `loopback-connector-twilio` package for inspiring me to build my own. While I'm sure `loopback-connector-twilio` will work for earlier versions of loopback (<4) but for some reason I couldn't get it to work with lb4.

## How to use it

### Install
`yarn add loopback-connector-twilio-ts`

or

`npm install loopback-connector-twilio-ts`

### prerequisites
One has to have a twilio account setup with a phone # that supports sms and calls. This lib expects that you know how to do this. For assistance on that please refer to their help docs.

This next part is optional, in terms of making it work, but is still a good idea to protect these values from public eyes. If you don't already have one set up create an `.env` file and add the following two lines:
```
TWILIO_SID=some-twilio-sid
TWILIO_AUTH_TOKEN=some-twilio-auth-token
```

Create a new datasource file: `src/datasources/twilio.datasource.ts`:
```
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// import the TwilioConnector class and use it as the connector in the config
import { TwilioConnector } from 'loopback-connector-twilio-ts';

const config = {
  name: 'twilio',
  connector: TwilioConnector, // class goes here
  accountSid: process.env.TWILIO_SID ?? '',
  authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
};

@lifeCycleObserver('datasource')
export class TwilioDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'twilio';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.twilio', {optional: true})
    dsConfig: object = config,
  ) {
    super('twilio', dsConfig);
  }
}
```
Add it to the index file: `src/datasources/index.ts`
```
...
export * from './twilio.datasource';
```
Add a model that represents the message that's going to be sent: `src/models/twilio.model.ts`
```
import {Model, model, property} from '@loopback/repository';

@model()
export class TwilioMessage extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  to: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
    required: true,
  })
  body: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'string',
  })
  subject?: string;

  @property({
    type: 'string',
  })
  text?: string;

  @property({
    type: 'string',
  })
  html?: string;

  constructor(data?: Partial<TwilioMessage>) {
    super(data);
  }
}

export interface TwilioMessageRelations {
  // describe navigational properties here
}

export type TwilioMessageWithRelations = TwilioMessage & TwilioMessageRelations;
```
Add model to the index file: `src/models/index.ts`
```
...
export * from './twilio.model';
```
Create a twilio service `src/services/twilio.service.ts`
```
import {GenericService, getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {TwilioDataSource} from '../datasources';
import {TwilioMessage} from '../models';

export interface Twilio extends GenericService {
  send(data: TwilioMessage): Promise<unknown>;
}

export class TwilioProvider implements Provider<Twilio> {
  constructor(
    @inject('datasources.twilio')
    protected dataSource: TwilioDataSource = new TwilioDataSource(),
  ) {}

  value(): Promise<Twilio> {
    return getService(this.dataSource);
  }
}
```
Add service to index file: `src/services/index.ts`
```
...
export * from './twilio.service';
```
Inject the service into a controller method that might need the twilio service
```
export class SomeController {
  ... constructor and other methods

  @post('/send-message')
  async send(
    @inject('services.Twilio') twilioProvider: Twilio, // injected service
  ): Promise<{token: string}> {

    twilioProvider.send(new TwilioMessage({
      type: 'sms', // supports 'sms' and 'call'
      to: 'some valid phone #',
      from: 'phone # purchased through twilio',
      body: 'Sending with twilio & LoopBack is Fun',
    })).then((a) => {
      console.log('a', a);
    }).catch((e) => {
      console.error('e', e);
    });

  }

  ... other methods

}
```
One could also inject the service into the class controller constructor like you would any other service/repository
