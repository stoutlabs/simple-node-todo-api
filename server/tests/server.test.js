const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const { todos, users, populateTodos, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should not create todo with invalid body data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return a 404 code when using a non-object id", done => {
    request(app)
      .get(`/todos/123abc`)
      .expect(404)
      .end(done);
  });

  it("should return a 404 code if todo not found", done => {
    var id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should return todo doc", done => {
    var id = todos[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe("First test todo");
      })
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    var id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should return 404 if todo not found", done => {
    var id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if object ID is invalid", done => {
    request(app)
      .delete(`/todos/123abc`)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update the todo", done => {
    var id = todos[0]._id.toHexString();
    var text = "Some new text";

    //update text, set completed true
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end(done);
  });

  it("should clear completedAt when todo is not completed", done => {
    // grab id of 2nd item
    // update text, set completed to false
    // 200
    // text is changed, completed is false, completedAt is null (.toNotExist)

    var id = todos[1]._id.toHexString();
    var text = "Some new text 2";

    //update text, set completed true
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user, if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a new user", done => {
    var email = "testing@someplace.net";
    var password = "123xyz";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then(user => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });

  it("should return validation errors if request invalid", done => {
    var email = "invalidemail";
    var password = "blah123";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.body.errors).toExist();
      })
      .end(done);
  });

  it("should not create a user if email is in use", done => {
    var email = users[0].email;
    var password = "1234567";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      // .expect(res => {
      //   expect(res.body.code).toBe(11000);
      // })
      .end(done);
  });
});
