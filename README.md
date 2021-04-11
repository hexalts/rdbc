# Realtime Database

Hexalts Realtime Database is an alternative to Firestore by Google's Firebase.

![CI Workflow](https://github.com/hexalts/rdbc/actions/workflows/main.yml/badge.svg)

> I will actively maintain this package since it is currently a beta build. I also will finish the server side really soon.

## Example

---

### Once

Let's say you already have a MongoDB with collection `cats` with multiple documents of `cat`. You want to get it all for once, it is as easy as

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const getAllCats = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  const result = await db.Collection('cats').Once();
  console.log(result);
};

getAllCats();
```

### Stream

What if you want to listen to changes that affected any documents inside `cats` collection, while you get all documents inside `cats` collection at once? No worries, because it is as easy as

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const watchThoseCats = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  const listener = db.Collection('cats').Stream();
  listener.on('snapshot', snapshot => {
    console.log(snapshot);
  });
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

Let's say you want to get any `persian medium` cats with age greater than 1. All you need to do is

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const whereAreThoseCats = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  db.Collection('cats');
  db.Query('race|==|persian medium');
  db.Query('age|>|1');
  const listener = db.Stream();
  listener.on('snapshot', snapshot => {
    console.log(snapshot);
  });
};

whereAreThoseCats();
```

And it will return

```
[
  {
    _id: '1',
    name: 'ciyo,
    age: 2,
    race: 'persian medium',
  },
  {
    _id: '3',
    name: 'mio,
    age: 3,
    race: 'persian medium'
  },
]
```

First, it will fetch you all documents which meets your rules. And then, once a document (which meets the rules) got changed, an event will be emitted over the `listener.on` with event name `snapshot`, the data it emits is the one which got changed, it will not return the whole documents (which meets the rules) because that is so inefficient.

By default, if you input the `Query` without any specs, such as

```javascript
db.Query('1')
```

It means you are pointing to a `document` with `_id` of `'1'`.

### Update

Let's say you inputted `ciyo` accidentally (it should be `cio`) and you want to update the document. Well, you got two ways to do that.

1. If you know the document id.

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const changeCatName = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  db.Collection('cats');
  db.Query('1');
  const result = await db.Update({ name: 'cio' });
  console.log(result);
};

changeCatName();
```
2. If you don't remember the document id.

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const changeCatName = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  db.Collection('cats');
  db.Query('name|==|cio');
  const result = await db.Update({ name: 'cio' });
  console.log(result);
};

changeCatName();
```
### Delete
Let's say `cio` has just passed away and you want to move on, completely. All you need to do is

```javascript
import { RealtimeDatabase } from '@hexalts/rdbc';

const byeByeCat = async () => {
  const db = new RealtimeDatabase({ ...authentication });
  db.Collection('cats');
  db.Query('1');
  const result = await db.Delete();
  console.log(result);
};

byeByeCat();
```
Note that it is only possible to delete a document if you remember it's id, just like you remember it's soul.

## Full API Documentation

For deeper understanding of Hexatls Realtime Database APIs, please refer to [this dcumentation](https://hexalts.github.io/rdbc/classes/realtimedatabase.html).