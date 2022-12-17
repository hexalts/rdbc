import RDB from '../dist';

const instanceId = String(Date.now());
const instance = new RDB(instanceId, {
  communicator: {
    host: 'ws://localhost:1883',
  },
  host: 'http://localhost:3001',
});

const payload = [
  {
    content: 'all good?',
    group: 'advanced test',
  },
  {
    content: 'all ok?',
    group: 'advanced test',
  },
  {
    content: 'u good?',
    group: 'advanced test for u',
  },
  {
    content: 'u ok?',
    group: 'advanced test for u',
  },
];

describe('Advanced functionalities', () => {
  it('Create new multiple data', async () => {
    const query = instance
      .database('test')
      .collection('test')

    const result = await query.create(payload);
    expect(result.insertedCount).toBe(payload.length);
  });

  it('Get data by condition', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u');

    const result = await query.get();
    expect(result.length).toBe(2);
  });

  it('Update data by condition', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u');

    const result = await query.update({ content: 'ye I good' });
    expect(result.modifiedCount).toBe(2);
  });

  it('Delete data by condition', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u');

    const result = await query.delete();
    expect(result.deletedCount).toBe(2);
  });
});
