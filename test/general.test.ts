import RDB from '../dist';

const instanceId = String(Date.now());
const instance = new RDB(instanceId, {
  communicator: {
    host: 'ws://localhost:1883',
  },
  host: 'http://localhost:3001',
});

const payload = {
  content: 'all good?',
};

describe('General functionalities', () => {
  let _insertedId: string;
  it('Create new data', async () => {
    const query = instance
      .database('test')
      .collection('test');

    const data = await query.create(payload);
    const { insertedId } = data;
    _insertedId = insertedId;
    expect(insertedId).toBeTruthy();
  });

  it('Get data by id', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId);

    const data = await query.get();
    expect(data.length).toBe(1);
  });

  it('Update data by id', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId);
    const data = await query.update({ content: 'ye all good' });
    expect(data.modifiedCount).toBe(1);
  });

  it('Delete data by id', async () => {
    const query = instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId);

    const data = await query.delete();
    expect(data.deletedCount).toBe(1);
  });
});
