var expect = require('chai').expect;
var supertest = require('supertest');
var server = require('../server');
var User = require('../models/user-model');

describe('User tests', () => {
  //fake user data that we'll use for tests
  var users = [
    {username: 'test1', email: 'test1@gmail.com', password: 'pass1'},
    {username: 'test2', email: 'test2@gmail.com', password: 'pass2'},
    {username: 'test3', email: 'test3@gmail.com', password: 'pass3'},
    {username: 'abc', email: 'abc@gmail.com', password: 'abc123'},
  ];
  //you can use 'before' to seed your database with data before your tests
  //you only need one 'before' statement
  //theres also a 'beforeEach' method if you want a function to run before each of your tests, individually
  before(() => {
    return User.sync({force: true})
    .then(() => User.bulkCreate(users))
    .catch((err) => console.log('DB Err!', err));
  });

  //this is just an example of how to do a basic test, in this case to he '/' route
  it(`'/' should respond with 'hello world!'`, (done) => {
    supertest(server)
      .get('/')
      .end((err, res) => {
        expect(res.text).to.eql('hello world!');
        //done is required in order to execute the test
        done();
      })
  });

  //example of how to do a test to get all users route
  it(`'/users' should respond with all users`, (done) => {
    supertest(server)
      .get('/users')
      .end((err, res) => {
        expect(res.body.length).eql(4);
        expect(res.body[0].username).equal(users[0].username);
        expect(res.body[1].username).equal(users[1].username);
        expect(res.body[2].username).equal(users[2].username);
        expect(res.body[3].username).equal(users[3].username);
        done();
      })
  });

  //testing the GET individual user by id route
  it(`'/users/:id' should respond with one user matching that id in an object`, (done) =>{
    supertest(server)
      .get('/users/id/1')
      .end((err,res)=>{
        expect(typeof res.body).eql('object');
        expect(res.body.username).equal(users[0].username);
        expect(res.body.email).equal(users[0].email);
        expect(res.body.password).equal(users[0].password);
        done();
      })
  });

  //testing the GET individual user by username
  it(`'/users/:username' should respond with one user matching that username in an array`, (done)=>{
    supertest(server)
      .get('/users/username/test2')
      .end((err,res)=>{
        expect(res.body.length).eql(undefined);
        expect(res.body.username).equal(users[1].username);
        expect(res.body.email).equal(users[1].email);
        expect(res.body.password).equal(users[1].password);
        done();
      })
  });

  //testing the GET users sorted a-z by username
  it(`'/users/sort/a-z' should respond with all users with their name sorted alphabetically`, (done)=>{
    supertest(server)
      .get('/users/sort/a-z')
      .end((err,res)=>{
        expect(res.body.length).equal(4);
        expect(res.body[0].username).equal(users[4].username);
        expect(res.body[1].username).equal(users[0].username);
        expect(res.body[2].username).equal(users[1].username);
        expect(res.body[3].username).equal(users[2].username);
        done();
      })
  });

  //testing the POST a new user
  it(`'/users' should respond with information of user that was created`, (done)=>{
    supertest(server)
      .post('/users')
      .send({username: 'test4', email: 'test4@gmail.com', password: 'pass4'})
      .get('/users/username/test4')
      .end((err,res)=>{
        expect(res.body.username).equal('test4');
        expect(res.body.email).equal('test4@gmail.com');
        expect(res.body.password).equal('pass4');
        done();
      })
  })
});
