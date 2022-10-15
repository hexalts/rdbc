import { MqttClient } from 'mqtt';
import { Database } from './database';
import { ServerConfiguration } from './types/serverConfiguration';
import { createMQTTInstance } from './utils/MQTT/createMQTTInstance';

/**
 * Realtime Database by Hexalts.
 */
export default class RDB {
  /**
   * Realtime Database Class Constructor.
   */
  constructor(
    private instanceId: string,
    private serverConfiguration: ServerConfiguration
  ) {}
  /**
   * Create an MQTT Instance for custom actions.
   */
  createMQTTInstance(): MqttClient {
    return createMQTTInstance(this.serverConfiguration);
  }
  /**
   * Set a collection name.
   */
  database(database: string): Database {
    return new Database(this.instanceId, this.serverConfiguration, database);
  }
}
