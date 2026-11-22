const test = require('node:test');
const assert = require('node:assert/strict');
const { Database } = require('../src/database/Database');

test('Repository/DB: a failed transaction rolls every change back', async () => {
  const db = Database.getInstance({ file: null });
  db.reset();
  await assert.rejects(db.transaction(async () => {
    db.insert('resources', { name: 'Temp' });
    throw new Error('fail');
  }), /fail/);
  assert.equal(db.all('resources').length, 0);
  await db.transaction(async () => { db.insert('resources', { name: 'Kept' }); });
  assert.equal(db.all('resources').length, 1);
});
