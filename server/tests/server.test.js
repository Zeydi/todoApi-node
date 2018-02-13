const bcrypt = require('bcryptjs');

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require ('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET/todos/', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1)
      })
      .end(done);
  })
})
describe('GET/todos/:id', () => {
  it('should get a todo with id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not get a todo with other id', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('Should return 404 if todo not found', (done) => {
    var  hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE/todos/:id', () => {
  it('should delete a todo', (done) => {
    const hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist;
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not delete a todo', (done) => {
    const hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
  it('should return 404 if todo not found', (done) => {
    var  hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
});

describe('PATCH/todos/:id', () => {
  it('should update a todo', (done) => {
     const hexId = todos[0]._id.toHexString();
     const modified = {
      text : 'new todo',
      completed: true
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modified)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toEqual(modified.text)
      })
      .end(done);
  });
  it('should not update another user todo', (done) => {
     const hexId = todos[0]._id.toHexString();
     const modified = {
      text : 'new todo',
      completed: true
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(modified)
      .expect(404)
      .end(done);
  });
  it('should clear completedAt when to do is not completed', (done) => {
    const hexId = todos[0]._id.toHexString();
    const modified = {
     text : 'new todo',
     completed: false
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modified)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  })
})

describe('GET/user/:id', () => {
  it('should get user with id', (done) => {
    var id = '5a801d4d9337e42fbf74a0f7';
    request(app)
      .get(`/users/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toEqual(users[1]._id)
      })
      done();
  });

  it('should return 404 when user not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .get(`/users/${id}`)
      .expect(404)
    done();
    })
  it('should return 404 with no object id', (done) => {
    request(app)
      .get('/users/123abcde')
      .expect(404)
      done();
  })
});

/*describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {

    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
});*/

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email= 'test1@mail.com'
    let password='azertyuiop'
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, res) => {
        password = res;
      });
    });
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.email).toBe(email)
        expect(res.body._id).toExist();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

      User.findOne({email}).then((user) => {
        expect(user).toExist();
        done();
      }).catch((e) => { done(e)})
    });
  });
  it('should return validation error if request invalid', (done) => {
    const email = 'azerty'
    const password = '123azcbn'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      done();
  });
  it('should not create user when email in use', (done) => {
    const email = 'user1@exmple.com'
    const password = '123azerty'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      done();
  })
})

describe('POST /users/login', () => {
  it('should return user', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) =>{
          if (!user) {
            return done(err)
          }
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => { done(e)})
      });
  });
  it('should return 400 when user not exist', (done) =>{
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '12'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) =>{
          if (!user) {
            return done(err)
          }
          expect(user.tokens.length).toBe(1)
          done();
        }).catch((e) => { done(e)})
      });
  })
})

describe('DELETE /users/me/token' , () => {
  it('should remove auth token on logout ', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err) => {
        if (err) {
          done(err);
        }

        User.find({ email: users[0].email }).then((user) => {
          expect(user[0].tokens.length).toBe(0)
          done();
        }).catch((e) => { done(e)})
      })

  });
});
