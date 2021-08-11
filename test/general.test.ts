import RDBC from '../src';

const database = 'tester';
const collection = 'test';
const brokerHost = `${process.env.BROKER_PROTOCOL}://${process.env.BROKER_HOSTNAME}:${process.env.BROKER_PORT}`;
const instanceId = process.env.INSTANCE_ID ? process.env.INSTANCE_ID : `${Date.now()}-hexaltsDeafult-${Date.now() * Math.random()}`
const RDB = new RDBC(
  {
    host: brokerHost,
    username: process.env.BROKER_USERNAME,
    password: process.env.BROKER_PASSWORD,
  },
  instanceId
);
const instance = RDB.Database(database).Collection(collection);
describe('Realtime Database instance test scenario', () => {
  it('Database target sets correctly', () => {
    expect(instance.Status().database).toEqual(database);
  });
  it('Collection target sets correctly', () => {
    expect(instance.Status().collection).toEqual(collection);
  });
  const client = RDB.CreateMQTTInstance();
  it('Connect to broker host', async () => {
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
  let referenceId = '';
  it('Create', async () => {
    const response = await instance.Create({
      type: 'tester',
      test: 'from jest',
    });
    referenceId = response[0].insertedId;
    instance.Where('_id', '==', referenceId);
    expect(response[0].acknowledged).toEqual(true);
  });
  it('Get', async () => {
    const response = await instance.Get();
    expect(response.length === 1).toEqual(true);
  });
  it('Update', async () => {
    const response = await instance.Update({ test: 'should be true' });
    expect(
      response[0].acknowledged &&
        response[0].modifiedCount === 1 &&
        response[0].matchedCount === 1
    ).toEqual(true);
  });
  it('Delete', async () => {
    const response = await instance.Delete();
    expect(response[0].acknowledged && response[0].deletedCount === 1).toEqual(
      true
    );
  });
});
