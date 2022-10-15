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
    const result = await instance
      .database('test')
      .collection('test')
      .create(payload);
    const { insertedId } = result;
    _insertedId = insertedId;
    expect(result).toBeTruthy();
  });

  it('Get data by id', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId)
      .get();
    expect(result.length).toEqual(1);
  });

  it('Update data by id', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId)
      .update({ content: 'ye all good' });
    expect(result.modifiedCount).toEqual(1);
  });

  it('Delete data by id', async () => {
    const result = await instance
      .database('test')
      .collection('test')
      .where('_id', '==', _insertedId)
      .delete();
    expect(result.deletedCount).toEqual(1);
  });
});
