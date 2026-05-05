const db = require('../backend/db');

describe('db.js', function() {
  it('should be defined', function() {
    expect(db).toBeDefined();
  });

  it('should have a run method', function() {
    expect(typeof db.run).toBe('function');
  });

  it('should have a get method', function() {
    expect(typeof db.get).toBe('function');
  });
});
