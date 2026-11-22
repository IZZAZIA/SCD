const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../src/utils/security');

test('passwords are stored as salted hashes and verify correctly', () => {
  const hash = hashPassword('Secret123');
  assert.notEqual(hash, 'Secret123');
  assert.notEqual(hash, hashPassword('Secret123'), 'salt makes every hash unique');
  assert.equal(verifyPassword('Secret123', hash), true);
  assert.equal(verifyPassword('wrong', hash), false);
});

test('tokens verify, and tampered or expired tokens are rejected', () => {
  const token = signToken({ sub: 7 }, 'secret', 60);
  assert.equal(verifyToken(token, 'secret').sub, 7);
  assert.equal(verifyToken(token, 'other-secret'), null);
  assert.equal(verifyToken(`${token}x`, 'secret'), null);
  assert.equal(verifyToken(signToken({ sub: 7 }, 'secret', -10), 'secret'), null);
});
