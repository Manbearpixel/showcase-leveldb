const level = require('level');
const sub   = require('subleveldown');
const db    = level('./db', {
  valueEncoding: 'json'
});

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
 * Batch writes initial data for LevelDB
 */
const preload = async () => {
  const writeBatch = [
    { type: 'put', key: 'user:111', value: 'Apple' },
    { type: 'put', key: 'user:222', value: 'Grape' },
    { type: 'put', key: 'user:333', value: 'Orange' },
    { type: 'put', key: 'user:444', value: 'Pinapple' }
  ];
  
  try {
    let complete = await db.batch(writeBatch);
    console.log('Preload Complete', complete);
  } catch (err) {
    console.log('[ERROR] Unable to continue', err);
    console.log('Closed', await db.close());
    process.exit(1);
  }
}

/**
 * Deletes an array of keys from the active database.
 * 
 * @param {Array} keys An array of keys to delete from opened database instance
 */
const cleanup = async (keys) => {
  return new Promise(async (resolve, reject) => {
    let deleteBatch = keys.map(k => {
      return { type: 'del', key: k };
    });
  
    try {
      let complete = await db.batch(deleteBatch);
      console.log('Cleanup Complete');
      return resolve(true);
    } catch (err) {
      console.log('[ERROR] Unable to continue', err);
      console.log('Closed', await db.close());
      process.exit(1);
    }
  });
}

/**
 * Inserts an additional user to database
 * Creates a stream that reads all values from the database
 * Sends cleanup a list of keys to purge from database
 */
const main = async () => {
  try {
    let dbKeys = [];

    // insert [key] with [value] into db datastore
    await db.put('user:555', 'Cucumber');

    // fetch [key] from db datastore
    console.log('[GET] "user:222" ... ', await db.get('user:222'));

    db.createReadStream()
    .on('data', function (data) {
      console.log(`[STREAM] ${data.key}=${data.value}`);
      dbKeys.push(data.key);
    })
    .on('error', async function (err) {
      console.log('[ERROR] Unable to continue', err);
      console.log('Closed', await db.close());
      process.exit(1);
    })
    .on('end', async function () {
      console.log('[STREAM] Complete');
      
      cleanup(dbKeys)
      .then(async () => {
        console.log('Database Closed', await db.close());
        process.exit(0);
      });
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

preload();
main();
