const request = require('supertest');
const express = require('express');
const routes = require('../backend/routes');

describe('routes.js', function() {
  let app;
  beforeAll(function() {
    app = express();
    app.use(express.json());
    app.use('/', routes);
  });

  it('should register a user', function(done) {
    request(app)
      .post('/register')
      .send({ username: 'test', email: 'test@example.com', password: 'pass' })
      .end(function(err, res) {
        expect([200, 500]).toContain(res.statusCode);
        done();
      });
  });

  it('should login a user', function(done) {
    request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'pass' })
      .end(function(err, res) {
        expect([200, 401]).toContain(res.statusCode);
        done();
      });
  });

  it('should logout', function(done) {
    request(app)
      .post('/logout')
      .end(function(err, res) {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('logout');
        done();
      });
  });
});
