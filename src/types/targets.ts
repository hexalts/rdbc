import { ServerConfiguration } from './serverConfiguration';

export interface Targets {
  /**
   * database name.
   */
  database: string;
  /**
   * Collection name.
   */
  collection: string;
  instanceId: string;

  serverConfiguration: ServerConfiguration;
}
