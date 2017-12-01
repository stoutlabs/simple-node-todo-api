const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");

// Todo.remove
// Todo.remove({}).then(result => {
//   console.log(result);
// });

//both of these return the document deleted
//Todo.findOneAndRemove();
//Todo.findByIdAndRemove();

// Todo.findOneAndRemove({_id: 'ersdfs'}).then(todo => {
// 	console.log(todo);
// });

// Todo.findByIdAndRemove('object_id_here').then( todo => {
// 	console.log(todo);
// });
