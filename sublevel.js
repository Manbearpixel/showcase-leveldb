const level = require('level');
const sub   = require('subleveldown');
const db    = level('./db', {
  valueEncoding: 'json'
});

const UserDB    = sub(db, 'users', { valueEncoding: 'json', separator: '###' });
const MessageDB = sub(UserDB, 'messages', { valueEncoding: 'json', separator: '```' });

/**
 * Event watchers for LevelDB
 */
db.on('put', function (key, value) {
  console.log('[Event::PUT]', { key: key, value: value });
});

db.on('del', function (key, value) {
  console.log('[Event::DELETE]', { key: key, value: value });
});

db.on('open', function (key, value) {
  console.log('[Event::OPEN]');
});

db.on('closed', function (key, value) {
  console.log('[Event::CLOSED]');
});

/**
 * Writes initial data for LevelDB
 */
const preload = () => {
  let username = 'user123';

  return new Promise((resolve, reject) => {
    UserDB.put('user123', 'unique_id')
    .then(() => {
      let personalDb = sub(MessageDB, username, { valueEncoding: 'json', separator: '$!$' });
      personalDb.put('uniqueHash1', { message: 'Apple' })
      .then(() => { return personalDb.put('uniqueHash2', { message: 'Orange' }) })
      .then(() => {
        console.log('Preload Complete');
        resolve(true);
      }).catch(reject);
    }).catch(reject);
  });
}

/**
 * 
 */
const main = async () => {
  try {
    let personalDb = sub(MessageDB, 'user123', { valueEncoding: 'json', separator: '$!$' });

    UserDB.createReadStream().on('data', (data) => {
      console.log(`[user] ${data.key}=${JSON.stringify(data.value)}`);
    });

    MessageDB.createReadStream().on('data', (data) => {
      console.log(`[msg] ${data.key}=${JSON.stringify(data.value)}`);
    });

    personalDb.createReadStream().on('data', (data) => {
      console.log(`[personal] ${data.key}=${JSON.stringify(data.value)}`);
    });
    
  } catch (err) {
    // Level throws the error "NotFoundError" if a key is non-existent
    if (err.notFound) {
      console.log('[ERROR] Specified key not found within keystore');
      console.log('Closed', await db.close());
      process.exit(1);
    }

    console.log('[ERROR] Unable to continue', err);
    console.log('Closed', await db.close());
    process.exit(1);
  }
}

preload()
.then(() => {
  main();
})
.catch(async (err) => {
  console.log('[ERROR] Unable to continue', err);
  console.log('Closed', await db.close());
  process.exit(1);
});

