import { RealtimeDatabase } from '../src';

const timestamp = Date.now();
const db = new RealtimeDatabase(
  {
    host: 'mqtt://test.mosquitto.org:1883',
    password: '',
    username: '',
  },
  timestamp
);

describe('Instance test scenario', () => {
  it('Get custom instance ID', () => {
    expect(db.InstanceId).toEqual(timestamp);
  });
  const client = db.createMQTTInstance();
  it('Connect to a broker host', async () => {
    const result = new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 10000);
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
