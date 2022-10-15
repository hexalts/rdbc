import { ServerConfiguration } from '../types/serverConfiguration';
import { Collection } from './collection';

export class Database {
  constructor(
    private instanceId: string,
    private serverConfiguration: ServerConfiguration,
    private database: string
  ) {}
  /**
   * Set a collection name.
   */
  collection(collection: string): Collection {
    return new Collection(
      this.instanceId,
      this.serverConfiguration,
      this.database,
      collection
    );
  }
}
