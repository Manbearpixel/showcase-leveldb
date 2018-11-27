# NodeJS LevelDB Showcase
This repository demonstrates the basic functionality of [LevelDB](https://github.com/google/leveldb) within a NodeJS runtime.

## What is LevelDB
LevelDB is a fast key-value and lightweight storage library with bindings to many platforms. LevelDB supports arbitrary byte arrays as both keys and values, singular get, put and delete operations, batched put and delete, bi-directional iterators and simple compression using the very fast Snappy algorithm.

LevelDB for NodeJS comes in many flavors but the primary is [Level](https://github.com/level/level) which is a bundled package and includes the wrapper [Levelup](https://github.com/level/levelup).

## Examples

### `simple.js`
The file `simple.js` demonstates the simple use of `Level` for key-value storage. It initially runs a batch operation call prefilling the database, then demonstates pulling a singular key-value, then demonstates a readable stream.

To execute this in the console, run `npm run simple`.

### `sublevel.js`
The file `sublevel.js` demonstates a more advanced use of `Level` combined with `Subleveldown` which is a layering helper for `Level`. It abstracts functionality to create associated key-value stores for a different key-value, thus showing off a one-to-many database relationship. It initially prefills a `username` into a `UserDB`. It then creates an instance of a personal message database for that user where two messages are stored. Afterwards, it demonstates a read stream for both the user, message, and personal database.

To execute this in the console, run `npm run sublevel`.

