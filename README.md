![CI Workflow](https://github.com/hexalts/rdbc/actions/workflows/main.yml/badge.svg)

> Make sure you have set up the RDB Server side. Please refer to [this](https://github.com/hexalts/rdb) link.

## Instalation

```shell
yarn add @hexalts/rdbc
```

## Example

---

### Once

Let's say you already have a MongoDB with collection `cats` with multiple documents of `cat`. You want to get it all for once.

First, you need to set up the RDB Configuration.

```javascript
import RDB from '@hexalts/rdbc';

const database = 'jembatanku';
const RDB = new RDB(
  {
    host: 'mqtt://broker.hivemq.com:1883',
  },
  database
);

```

Next step is to create a Collection instance. It goes like this.

```javascript
const instance = RDB.Collection('cats');
```

Note that you only need to do this setup for once. It is dead simple. Then you can get all those `cat` like this.

```javascript
const getAllCats = async () => {
  const result = await instance.Get();
  console.log(result.payload);
};

getAllCats();
```

### Stream

What if you want to listen to changes that affected any documents inside `cats` collection, while you get all documents inside `cats` collection at once? No worries, because it is as easy as

```javascript
const watchThoseCats = async () => {
  const stream = instance.Stream('all');
  stream.on('data', (data) => {
    console.log(data.payload);
  })
};

watchThoseCats();
```

### Query

What if you want to get documents with multiple rules? Let's assume you have such documents

```
[
  {
    _id: '1',
    name: 'ciyo,
    age: 2,
    race: 'persian medium',
  },
  {
    _id: '2',
    name: 'izzy',
    age: 1,
    race: 'persian medium'
  },
  {
    _id: '3',
    name: 'mio,
    age: 3,
    race: 'persian medium'
  },
  {
    _id: '4',
    name: 'qio,
    age: 4,
    race: 'himalayan'
  },
]

```

Let's say you want to get any `persian medium` cats with age greater than 1. It goes like this.

```javascript
const whereAreThoseCats = async () => {
  const stream = instance.Stream('all');
  instance.Where('race', '==', 'persian medium')
  instance.Where('age', '>', 1)
  stream.on('data', (data) => {
    console.log(data.payload);
  });
};

whereAreThoseCats();
```

It will return

```
{
  _id: '1',
  name: 'ciyo,
  age: 2,
  race: 'persian medium',
}
{
  _id: '3',
  name: 'mio,
  age: 3,
  race: 'persian medium'
},
```

First, it will fetch you all documents which meets your rules. And then, once a document (which meets the rules) got changed, an event will be emitted over the `stream.on` with event name `data`, the data it emits is the one which got changed, it will not return the whole documents (which meets the rules) again because that will be inefficient.

### Clear

A note to remember:

>The Where() method actually push any query into the instance state, it means you need to Clear the Where condition to default every time you need a different query pattern.

But don't worry, because it is as easy as this.

```javascript
instance.Clear();
```

### Update

Let's say you inputted `ciyo` accidentally (it should be `cio`) and you want to update the document. Well, you got two ways to do that.

1. If you know the document id.

```javascript
const changeCatName = async () => {
  instance.Where('_id', '==', '1')
  const result = await instance.Update({ name: 'cio' });
  console.log(result);
};

changeCatName();
```
2. If you don't remember the document id.

```javascript
const changeCatName = async () => {
  instance.Where('name', '==', 'ciyo')
  const result = await instance.Update({ name: 'cio' });
  console.log(result);
};

changeCatName();
```
### Delete
Let's say `cio` has just passed away and you want to move on, completely. Just like the Update method, you can use Where condition to delete it


1. If you know the document id.

```javascript
const changeCatName = async () => {
  instance.Where('_id', '==', '1')
  const result = await instance.Delete();
  console.log(result);
};

changeCatName();
```
2. If you don't remember the document id.

```javascript
const changeCatName = async () => {
  instance.Where('name', '==', 'ciyo')
  const result = await instance.Delete();
  console.log(result);
};

changeCatName();
```

## Full API Documentation

For deeper understanding of Hexatls Realtime Database APIs, please refer to [this dcumentation](https://hexalts.github.io/rdbc/classes/default.html).
