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
    const result = await instance
      .database('test')
      .collection('test')
      .create(payload);
    expect(result).toBeTruthy();
  });

  it('Get data by condition', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u')
      .get();
    expect(result.length).toEqual(2);
  });

  it('Update data by condition', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u')
      .update({ content: 'ye I good' });
    expect(result.modifiedCount).toEqual(2);
  });

  it('Delete data by condition', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('group', '==', 'advanced test for u')
      .delete();
    expect(result.deletedCount).toEqual(2);
  });
});
