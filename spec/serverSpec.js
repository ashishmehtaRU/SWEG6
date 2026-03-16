const request = require('supertest');
const express = require('express');
const routes = require('../backend/routes');

describe('server.js', function() {
  let app;
  beforeAll(function() {
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  it('should respond to /api/logout', function(done) {
    request(app)
      .post('/api/logout')
      .end(function(err, res) {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('logout');
        done();
      });
  });
});
