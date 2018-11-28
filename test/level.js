const Assert = require('assert');
const { TestDB, fnPurge }  = require('../lib/mediator');

const Users = [
  { id: 'user:111', item: 'Apple' },
  { id: 'user:222', item: 'Grape' },
  { id: 'user:333', item: 'Orange' },
  { id: 'user:444', item: 'Pinapple' }
];

// Event Watchers
TestDB.on('put', function (key, value) {
  console.log('[Event::PUT]', { key: key, value: value });
});

TestDB.on('del', function (key, value) {
  console.log('[Event::DELETE]', { key: key, value: value });
});

// wipe test db before starting
before('PurgeDB', (done) => {
  fnPurge(TestDB)
  .then(() => done())
  .catch(done);
});

describe('Basic LevelDB Usage', () => {

  before('Prefill Dummy Data', (done) => {
    const writeBatch = Users.map(u => {
      return {
        type: 'put',
        key: u.id,
        value: u.item
      }
    });
    
    TestDB.batch(writeBatch)
    .then(() => { return done(); })
    .catch(done);
  });

  describe('Level stores information', () => {
    it('should have dummy data', () => {
      let counter = 0;
  
      TestDB.createKeyStream()
      .on('data', () => counter++)
      .on('end', () => {
        Assert.equal(counter, Users.length);
      });
    });
  });

  describe('Level can fetch information', () => {
    it('should fetch a stored value from a key index', async () => {
      let item = await TestDB.get('user:111');
      Assert.equal(item, 'Apple');
    });
  
    it('should fetch all keys and values from a database', () => {
      let dbUsers = [];
  
      TestDB.createReadStream()
      .on('data', (user) => dbUsers.push(user))
      .on('end', () => {
        let expectedArray = dbUsers.filter(user => {
          let index = Users.findIndex(u => u.id === user.key);
          if (index === -1) return false;
          if (Users[index].item !== user.value) return false;
          return true;
        });
  
        Assert.equal(expectedArray.length, Users.length);
      });
    });
  });

  describe('Level can remove information', () => {

    it('should be able to remove a key', async () => {
      try {
        await TestDB.del(Users[0]);
        await TestDB.get(Users[0]);
      } catch(err) {
        return Assert.equal(err.notFound, true);
      }
    });

    it('should throw a "NotFoundError" when fetching a key that is missing', async () => {
      try {
        await TestDB.get('user:555');
      } catch(err) {
        return Assert.equal(err.notFound, true);
      }
    });

    it('should be able to remove all datasets', (done) => {
      fnPurge(TestDB)
      .then(() => {
        let counter = 0;

        TestDB.createKeyStream()
        .on('data', () => counter++)
        .on('end', () => {
          Assert.equal(counter, 0);
          done();
        });
      })
      .catch(done);
    });
  });
 });
