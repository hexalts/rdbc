import * as MQTT from "mqtt";
import { EventEmitter } from "events";

/**
 * MQTT Broker Host Configuration
 */
export interface BrokerConfiguration {
  /**
   * MQTT Host
   *
   * Make sure you have access rights to the host
   *
   * @example
   * host = 'mqtt://broker.hivemq.com:1883'
   */
  host?: string;
  /**
   * MQTT Username
   */
  username?: undefined | string;
  /**
   * MQTT Password
   */
  password?: undefined | string;
}

/**
 * Query template.
 */
export interface Query {
  /**
   * Document field name.
   */
  field: string;
  /**
   * Query selector.
   */
  operator: "==" | "<=" | ">=" | "<" | ">" | "!=";
  /**
   * Value to compare.
   */
  value: any;
}

/**
 * Document structure.
 */
export interface Document {
  [index: string]: any;
}

/**
 * RDB current target state.
 */
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
}

export interface Payload {
  /**
   * Payload type.
   */
  type: "start" | "reply" | "end" | "changeStream" | "error";
  /**
   * Operation type.
   */
  operation: "create" | "get" | "update" | "replace" | "delete";
  /**
   * Query list.
   */
  query: Query[];
  /**
   * Payload actual data.
   */
  payload: any;
}

/**
 * Database response.
 */
export interface RespondType {
  pattern: string;
  data: Payload;
}

declare interface Stream {
  on(event: "data", listener: (payload: any) => void): this;
  on(event: "delete", listener: (payload: { _id: string }[]) => void): this;
  once(event: "off", listener: () => void): this;
  once(event: "data", listener: (payload: any) => void): this;
  once(event: "delete", listener: (payload: { _id: string }[]) => void): this;
}

class Stream extends EventEmitter {
  end() {
    this.emit("off", true);
  }
}

/**
 * Create an MQTT Connection instance.
 * @param config
 */
export const createMQTTInstance = (
  config: BrokerConfiguration = {
    host: "",
    password: undefined,
    username: undefined,
  }
): MQTT.MqttClient => {
  return MQTT.connect(config.host, {
    username: config.username,
    password: config.password,
  });
};

const payloadProcessor = async (
  instanceId: string,
  broker: BrokerConfiguration,
  queries: Query[],
  action: "create" | "get" | "update" | "delete",
  database: string,
  collection: string,
  payload: object
) => {
  return new Promise<{ [field: string]: any }[]>((resolve, reject) => {
    let shouldPass = false;
    switch (action) {
      case "create":
        if (queries.length !== 0) {
          console.warn(
            "Where condition were set and will always be ignored in Create function"
          );
        }
        shouldPass = true;
        break;
      case "get":
        shouldPass = true;
        break;
      case "update":
        if (queries.length === 0) {
          console.error(
            "Where condition must be set in order to use Update function"
          );
        } else {
          shouldPass = true;
        }
        break;
      case "delete":
        if (queries.length === 0) {
          console.error(
            "Where condition must be set in order to use Delete function"
          );
        } else {
          shouldPass = true;
        }
        break;
      default:
        break;
    }
    if (shouldPass) {
      const id = Date.now();
      const topics = {
        publish: `${instanceId}/request/${database}/${collection}/${id}`,
        subscribe: `${instanceId}/payload/${database}/${collection}/${id}`,
      };
      const requestPayload: Payload = {
        type: "start",
        operation: action,
        query: queries,
        payload: payload,
      };
      const clientConnection = createMQTTInstance(broker);
      clientConnection.once("connect", () => {
        const dataContainer: { [field: string]: any }[] = [];
        clientConnection.subscribe(topics.subscribe);
        clientConnection.on("message", (_topic, payload) => {
          const response: RespondType = JSON.parse(payload.toString());
          if (response.data.type === "end") {
            resolve(dataContainer);
            clientConnection.end();
          } else if (response.data.type === "error") {
            reject(response);
          } else if (response.data.type === "reply") {
            dataContainer.push(...response.data.payload);
          }
        });
        clientConnection.publish(
          topics.publish,
          JSON.stringify(requestPayload)
        );
      });
    } else {
      reject("Cannot proceed. Please recheck your query.");
    }
  });
};

/**
 * Realtime Database by Hexalts.
 */
export default class RDB {
  /**
   * Realtime Database Class Constructor.
   */
  constructor(
    private broker: BrokerConfiguration = {
      host: "mqtt://broker.hivemq.com:1883",
    },
    private instanceId: string
  ) {}
  /**
   * Create an MQTT Instance for custom actions.
   */
  CreateMQTTInstance(): MQTT.MqttClient {
    return createMQTTInstance(this.broker);
  }
  /**
   * Set a collection name.
   */
  Database(database: string): Database {
    return new Database(this.instanceId, this.broker, database);
  }
}

export class Database {
  constructor(
    private instanceId: string,
    private broker: BrokerConfiguration,
    private database: string
  ) {}
  /**
   * Set a collection name.
   */
  Collection(collection: string): Collection {
    return new Collection(
      this.instanceId,
      this.broker,
      this.database,
      collection
    );
  }
}

/**
 * Collection Class.
 */
export class Collection {
  private queries: Query[] = [];
  private idSets: boolean = false;
  /**
   * Collection Class Constructor.
   */
  constructor(
    private instanceId: string,
    private broker: BrokerConfiguration,
    private database: string,
    private collection: string
  ) {}
  /**
   * Clear the Where query.
   */
  Clear() {
    this.queries = [];
  }
  /**
   * Get current Target state such as `collection` and `database`
   */
  Status(): Targets {
    return {
      collection: this.collection,
      database: this.database,
      instanceId: this.instanceId,
    };
  }
  /**
   * Set a Where query.
   *
   * @example
   * Collection.Where('fieldName', '==', 5)
   *
   */
  Where(
    field: string,
    operator: "==" | "<=" | ">=" | "<" | ">" | "!=",
    value: any
  ) {
    if (!this.idSets) {
      if (field === "_id") {
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
   * Stream for document changes from a Collection.
   *
   * @param method
   */
  Stream(method: "change" | "all" = "change") {
    const stream = new Stream();
    const clientConnection = createMQTTInstance(this.broker);
    if (method === "all") {
      this.Get().then((result) => stream.emit("data", result));
    }
    clientConnection.once("connect", () => {
      clientConnection.subscribe(
        `${this.instanceId}/stream/${this.database}/${this.collection}/#`
      );
      clientConnection.on("message", (_topic, payload) => {
        const content: RespondType = JSON.parse(payload.toString());
        if (content.data.operation === "delete") {
          stream.emit("delete", content.data.payload);
        } else {
          if (this.queries.length !== 0) {
            let shouldPass = true;
            this.queries.forEach((query) => {
              if (
                Array.isArray(content.data.payload) &&
                typeof content.data.payload[0] === "object" &&
                typeof content.data.payload[0][query.field] !== "undefined" &&
                shouldPass
              ) {
                switch (query.operator) {
                  case "!=":
                    if (
                      !(content.data.payload[0][query.field] !== query.value)
                    ) {
                      shouldPass = false;
                    }
                    break;
                  case "<":
                    if (!(content.data.payload[0][query.field] < query.value)) {
                      shouldPass = false;
                    }
                    break;
                  case "<=":
                    if (
                      !(content.data.payload[0][query.field] <= query.value)
                    ) {
                      shouldPass = false;
                    }
                    break;
                  case "==":
                    if (
                      !(content.data.payload[0][query.field] === query.value)
                    ) {
                      shouldPass = false;
                    }
                    break;
                  case ">":
                    if (!(content.data.payload[0][query.field] > query.value)) {
                      shouldPass = false;
                    }
                    break;
                  case ">=":
                    if (
                      !(content.data.payload[0][query.field] >= query.value)
                    ) {
                      shouldPass = false;
                    }
                    break;
                  default:
                    shouldPass = false;
                    break;
                }
              } else {
                shouldPass = false;
              }
            });
            if (shouldPass) {
              stream.emit("data", content.data.payload);
            }
          } else {
            stream.emit("data", content.data.payload);
          }
        }
      });
    });
    stream.once("off", () => {
      clientConnection.end(true);
    });
    return stream;
  }
  /**
   * Add a document to a collection.
   *
   * @param payload
   */
  async Create(payload: Document) {
    return payloadProcessor(
      this.instanceId,
      this.broker,
      this.queries,
      "create",
      this.database,
      this.collection,
      payload
    );
  }
  /**
   * Get documents from a Collection.
   */
  async Get() {
    return payloadProcessor(
      this.instanceId,
      this.broker,
      this.queries,
      "get",
      this.database,
      this.collection,
      {}
    );
  }
  /**
   * Update one or multiple documents from a Collection.
   *
   * @param payload
   */
  async Update(payload: object) {
    return payloadProcessor(
      this.instanceId,
      this.broker,
      this.queries,
      "update",
      this.database,
      this.collection,
      payload
    );
  }
  /**
   * Delete one or multiple documents from a Collection.
   */
  async Delete() {
    return payloadProcessor(
      this.instanceId,
      this.broker,
      this.queries,
      "delete",
      this.database,
      this.collection,
      {}
    );
  }
}
