import RDBC from '../src';
import { env } from 'process';

const database = 'tester';
const collection = 'test';
const brokerHost = `${env.BROKER_PROTOCOL}://${env.BROKER_HOSTNAME}:${env.BROKER_PORT}`;
console.log(brokerHost);
const RDB = new RDBC(
  {
    host: brokerHost,
    username: env.BROKER_USERNAME,
    password: env.BROKER_PASSWORD,
  },
  database
);
const instance = RDB.Collection(collection);
describe('Realtime Database instance test scenario', () => {
  it('Database target sets correctly', () => {
    expect(instance.Status().database).toEqual(database);
  });
  it('Collection target sets correctly', () => {
    expect(instance.Status().collection).toEqual(collection);
  });
  const client = RDB.CreateMQTTInstance();
  it('Connect to MQTT host', async () => {
    const result = new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      client
        .once('connect', () => {
          clearTimeout(timeout);
          client.end();
          resolve(true);
        })
        .once('error', () => {
          clearTimeout(timeout);
          client.end();
          reject(false);
        });
    });
    expect(await result).toEqual(true);
  });
});

describe('Collection functions test scenario', () => {
  afterEach(() => {
    instance.Clear();
  });
  it('Get', async () => {
    const response = await instance.Get();
    expect(response.type !== 'error').toEqual(true);
  });
  it('Create', async () => {
    const response = await instance.Create({
      type: 'tester',
      test: 'from jest',
    });
    expect(response.type !== 'error').toEqual(true);
  });
  it('Update', async () => {
    instance.Where('type', '==', 'tester');
    const response = await instance.Update({ test: 'should be true' });
    expect(response.type !== 'error').toEqual(true);
  });
  it('Delete', async () => {
    instance.Where('type', '==', 'tester');
    const response = await instance.Delete();
    expect(response.type !== 'error').toEqual(true);
  });
});
