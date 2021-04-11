/* eslint-disable @typescript-eslint/no-explicit-any */
import mqtt from 'mqtt';

/**
 * @ignore
 */
const createMQTTInstance = (
  host: string,
  username: string,
  password: string
) => {
  return mqtt
    .connect(host, {
      username: username,
      password: password,
    })
    .on('error', error => {
      console.error(error.message);
    });
};

/**
 * @ignore
 */
const Stream = (
  host: string,
  username: string,
  password: string,
  collection: string,
  query: string | string[] | null
) => {
  const timestamp = Date.now();
  const MQTTInstance = createMQTTInstance(host, username, password);
  MQTTInstance.once('connect', () => {
    MQTTInstance.on('message', (topic, message) => {
      const result = JSON.parse(message.toString());
      if (topic === 'payload/' + timestamp) {
        if (query) {
          if (query.includes('||') || query.includes('|')) {
            MQTTInstance.emit(
              'snapshot',
              Object.values(result.payload).map(value => value)
            );
            MQTTInstance.subscribe(
              'changestream/' + collection + '/#',
              error => {
                if (error) {
                  console.error(error.message);
                }
              }
            );
          } else {
            MQTTInstance.emit('snapshot', [result.payload]);
            MQTTInstance.subscribe(
              'changestream/' + collection + '/' + query,
              error => {
                if (error) {
                  console.error(error.message);
                }
              }
            );
          }
        } else {
          MQTTInstance.emit(
            'snapshot',
            Object.values(result.payload).map(value => value)
          );
          MQTTInstance.subscribe('changestream/' + collection + '/#', error => {
            if (error) {
              console.error(error.message);
            }
          });
        }
        MQTTInstance.unsubscribe('payload/' + timestamp);
      } else {
        if (result.operation === 'delete') {
          MQTTInstance.emit('snapshot', [
            { toBeDeleted: true, _id: result.message },
          ]);
        } else {
          MQTTInstance.emit('snapshot', [result.payload]);
        }
      }
    });
    MQTTInstance.subscribe('payload/' + timestamp, error => {
      if (!error) {
        if (query) {
          MQTTInstance.publish(
            'request/get/' + timestamp,
            collection + '|#|' + query
          );
        } else {
          MQTTInstance.publish('request/get/' + timestamp, collection + '|#|');
        }
      } else {
        console.error(error.message);
      }
    });
  });
  return MQTTInstance;
};

/**
 * @ignore
 */
const Once = async (
  host: string,
  username: string,
  password: string,
  collection: string | null,
  query: string | string[] | null
) =>
  new Promise<Record<string, any>[]>((resolve, reject) => {
    const timestamp = Date.now();
    const MQTTInstance = createMQTTInstance(host, username, password);
    MQTTInstance.once('connect', () => {
      MQTTInstance.once('message', (_topic, message) => {
        if (query && (query.includes('||') || query.includes('|'))) {
          resolve(
            Object.values(JSON.parse(message.toString()).payload).map(
              (document: any) => document
            )
          );
        } else {
          resolve([JSON.parse(message.toString()).payload]);
        }
        MQTTInstance.end();
      });
      MQTTInstance.subscribe('payload/' + timestamp, (error: Error | null) => {
        if (!error) {
          if (query) {
            MQTTInstance.publish(
              'request/get/' + timestamp,
              collection + '|#|' + query
            );
          } else {
            MQTTInstance.publish(
              'request/get/' + timestamp,
              collection + '|#|'
            );
          }
        } else {
          console.error(error.message);
          reject([error.message]);
          MQTTInstance.end();
        }
      });
    });
  });

/**
 * @ignore
 */
const Delete = async (
  host: string,
  username: string,
  password: string,
  collection: string,
  query: string
) =>
  new Promise<Record<string, any>[]>((resolve, reject) => {
    const timestamp = Date.now();
    const MQTTInstance = createMQTTInstance(host, username, password);
    MQTTInstance.once('connect', () => {
      MQTTInstance.once('message', (_topic: string, message: Buffer) => {
        resolve(JSON.parse(message.toString()));
        MQTTInstance.end();
      });
      MQTTInstance.subscribe('payload/' + timestamp, (error: Error | null) => {
        if (!error) {
          MQTTInstance.publish(
            'request/delete/' + timestamp,
            collection + '|#|' + query
          );
        } else {
          reject([error.message]);
          MQTTInstance.end();
        }
      });
    });
  });

/**
 * @ignore
 */
const Update = async (
  host: string,
  username: string,
  password: string,
  collection: string,
  query: string,
  payload: Record<string, string>
) =>
  new Promise<Record<string, any>[]>((resolve, reject) => {
    const timestamp = Date.now();
    const MQTTInstance = createMQTTInstance(host, username, password);
    MQTTInstance.once('message', (_topic: string, message: Buffer) => {
      resolve(JSON.parse(message.toString()));
      MQTTInstance.end();
    });
    MQTTInstance.subscribe('payload/' + timestamp, (error: Error | null) => {
      if (!error) {
        if (typeof payload !== 'undefined') {
          MQTTInstance.publish(
            'request/update/' + timestamp,
            collection + '|#|' + query + '|#|' + JSON.stringify(payload)
          );
        } else {
          console.error(
            'Payload type is not an object. Please review your code.'
          );
          reject(['Payload type is not an object. Please review your code.']);
          MQTTInstance.end();
        }
      } else {
        reject([error.message]);
        MQTTInstance.end();
      }
    });
  });

/**
 * Hexalts Realtime Database Framework.
 */
export class RealtimeDatabase {
  /**
   * Current collection name.
   */
  private collection: string | null;
  /**
   * Current query.
   */
  private query: string | null;
  /**
   * MQTT Broker address.
   */
  private host: string;
  /**
   * MQTT Username for authentication.
   */
  private username: string;
  /**
   * MQTT Password for authentication.
   */
  private password: string;
  /**
   * Current instance ID.
   */
  private instanceId: number;
  /**
   * Constructor of Hexalts Realtime Database Framework.
   *
   * Optionally set an instance ID. Defaults to current timestamp.
   *
   * @param {number} instanceId instance ID.
   */
  constructor(
    mqtt: { host: string; username: string; password: string },
    instanceId: number = Date.now()
  ) {
    this.collection = null;
    this.query = null;
    this.instanceId = instanceId;
    this.host = mqtt.host;
    this.username = mqtt.username;
    this.password = mqtt.password;
  }

  /**
   * Current instance ID.
   * @return {number} instance ID.
   */
  public get InstanceId(): number {
    return this.instanceId;
  }

  /**
   * Set or get a Collection name.
   *
   * @param {string} collection collection name.
   * @requires collection - ***Requires a collection name.***
   */
  Collection(collection: string | null): RealtimeDatabase {
    this.collection = collection;
    return this;
  }

  /**
   * Set or get a query for further action.
   *
   * @param {string} query query
   * @requires query - ***Requires a query string.***
   */
  Query(query: string | null): RealtimeDatabase {
    if (this.query) {
      this.query += '|#|' + query;
    } else {
      this.query = query;
    }

    return this;
  }

  /**
   * Listen for changes on a Collection and specific documents or where queries
   *
   * @requires collection - ***Requires initialized collection name.***
   * @returns {mqtt.MqttClient} MQTT Client
   */
  Stream(): mqtt.MqttClient {
    if (this.collection !== null) {
      return Stream(
        this.host,
        this.username,
        this.password,
        this.collection,
        this.query
      );
    } else {
      throw new Error('Collection is not defined.');
    }
  }

  /**
   * Read a Collection for Once
   * @requires collection - ***Requires initialized collection name.***
   * @returns {Promise<Record<string, any>[]>} Array of documents.
   */
  Once(): Promise<Record<string, any>[]> {
    if (this.collection !== null) {
      return Once(
        this.host,
        this.username,
        this.password,
        this.collection,
        this.query
      );
    } else {
      throw new Error('Collection is not defined.');
    }
  }

  /**
   * Delete documents from a Collection.
   * @requires collection - ***Requires initialized collection name.***
   * @requires query - ***Requires initialized query.***
   * @returns {Promise<Record<string, any>[]>} Server response.
   */
  Delete(): Promise<Record<string, any>[]> {
    if (this.collection !== null && this.query !== null) {
      return Delete(
        this.host,
        this.username,
        this.password,
        this.collection,
        this.query
      );
    } else {
      throw new Error('Collection or query is not defined.');
    }
  }

  /**
   * Update documents based on where queries
   * @param {Record<string, any>} Object Object payload
   * @requires collection - ***Requires initialized collection name.***
   * @requires query - ***Requires initialized query.***
   * @requires payload - ***Requires a payload object.*** can be any object.
   * @returns {Promise<Record<string, any>[]>} Server response.
   */
  Update(payload: Record<string, any>): Promise<Record<string, any>[]> {
    if (this.collection !== null && this.query !== null) {
      return Update(
        this.host,
        this.username,
        this.password,
        this.collection,
        this.query,
        payload
      );
    } else {
      throw new Error('Collection or query is not defined.');
    }
  }

  /**
   * Create an MQTT Client Instance for custom actions.
   * @returns {mqtt.MqttClient} MQTT Client Instance.
   */
  createMQTTInstance(): mqtt.MqttClient {
    return createMQTTInstance(this.host, this.username, this.password);
  }
}
