const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");

var userID = "5a0e6d9ffcb9fe652be0d6d8";

// var id = "5a0e649a728d563fa4c4cf26";
//
// if (!ObjectID.isValid(id)) {
//   console.log("ID not valid");
// }

// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log("Todos", todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log("todo", todo);
// });

// Todo.findById(id)
//   .then(todo => {
//     if (!todo) {
//       return console.log("Id not found");
//     }
//     console.log("todo by Id", todo);
//   })
//   .catch(e => console.log(e));

User.findById(userID)
  .then(user => {
    if (!user) {
      return console.log("User id not found");
    }
    console.log("User by Id", user);
  })
  .catch(e => console.log(e));
