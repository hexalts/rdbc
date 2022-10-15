import { Query } from '../../types/query';
import { Operator } from '../../types/operator';
import { Targets } from '../../types/targets';
import { payloadSender } from '../../utils/payload/sender';
import { ServerConfiguration } from '../../types/serverConfiguration';

export class Collection {
  private queries: Query[] = [];
  private idSets: boolean = false;
  /**
   * Collection Class Constructor.
   */
  constructor(
    private instanceId: string,
    private serverConfiguration: ServerConfiguration,
    private database: string,
    private collection: string
  ) {}
  /**
   * Clear the Where query.
   */
  clear() {
    this.queries = [];
  }
  /**
   * Get current Target state such as `collection` and `database`
   */
  status(): Targets {
    return {
      collection: this.collection,
      database: this.database,
      instanceId: this.instanceId,
      serverConfiguration: this.serverConfiguration,
    };
  }
  /**
   * Set a Where query.
   *
   * @example
   * Collection.Where('fieldName', '==', 5)
   *
   */
  where(field: string, operator: Operator, value: any) {
    if (!this.idSets) {
      if (field === '_id') {
        this.idSets = true;
        this.queries = [{ field, operator, value }];
      } else {
        this.queries.push({ field, operator, value });
      }
    } else {
      console.warn(`an _id has been set. Any other queries will be ignored.`);
    }
    return this;
  }
  /**
   * Add a document to a collection.
   *
   * @param payload
   */
  async create(payload: Record<string, unknown> | Record<string, unknown>[]) {
    return payloadSender({
      serverConfiguration: this.serverConfiguration,
      database: this.database,
      collection: this.collection,
      queries: this.queries,
      action: 'create',
      payload,
    });
  }
  /**
   * Get documents from a Collection.
   */
  async get() {
    return payloadSender({
      serverConfiguration: this.serverConfiguration,
      database: this.database,
      collection: this.collection,
      queries: this.queries,
      action: 'get',
      payload: {},
    });
  }
  /**
   * Update one or multiple documents from a Collection.
   *
   * @param payload
   */
  async update(payload: Record<string, unknown> | Record<string, unknown>[]) {
    return payloadSender({
      serverConfiguration: this.serverConfiguration,
      database: this.database,
      collection: this.collection,
      queries: this.queries,
      action: 'update',
      payload,
    });
  }
  /**
   * Delete one or multiple documents from a Collection.
   */
  async delete() {
    return payloadSender({
      serverConfiguration: this.serverConfiguration,
      database: this.database,
      collection: this.collection,
      queries: this.queries,
      action: 'delete',
      payload: {},
    });
  }
}
