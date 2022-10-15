import { BrokerConfiguration } from './brokerConfiguration';

export interface ServerConfiguration {
  host: string;
  communicator: BrokerConfiguration;
}
