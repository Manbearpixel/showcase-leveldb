const level   = require('level');
const sub     = require('subleveldown');
const db      = level('../db', {
  valueEncoding: 'json'
});

const TestDB    = sub(db, 'test', { valueEncoding: 'json', separator: '###' });
const UserDB    = sub(db, 'users', { valueEncoding: 'json', separator: '###' });
const MessageDB = sub(UserDB, 'messages', { valueEncoding: 'json', separator: '___' });

module.exports = {
  db:         db,
  UserDB:     UserDB,
  MessageDB:  MessageDB,
  TestDB:     TestDB,
  fnPurge:    (_db) => {
    return new Promise((resolve, reject) => {
      let dummyKeys = [];

      _db.createKeyStream()
      .on('data', (key) => dummyKeys.push(key))
      .on('end', async () => {
        let deleteBatch = dummyKeys.map(k => {
          return { type: 'del', key: k };
        });
    
        TestDB.batch(deleteBatch)
        .then(() => { return resolve(true) })
        .catch(reject);
      });
    });
  }
};
