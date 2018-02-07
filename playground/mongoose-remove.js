const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//Todo.remove({}).then((res) => {
//  console.log(res);
//})

Todo.findOneAndRemove({_id: '5a79d74f5df51171b7dd9f96' }).then((doc) => {
  console.log(doc)
});
Todo.findByIdAndRemove('5a79d74f5df51171b7dd9f96').then((doc) => {
  console.log(doc)
});
