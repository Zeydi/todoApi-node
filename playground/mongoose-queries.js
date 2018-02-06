const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
/*var id = '5a797d5735c7002992b36aff';

if (!ObjectID.isValid(id)) {
  console.log('ID not Valid !!!');
}
/*Todo.find({
  _id: id
}).then((todos) => {
  console.log('Todos', todos);
});
Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('Todo', todo);
});
Todo.findById(id).then((todoById) => {
  if (!todoById) {
    return console.log('id not found! ')
  }
  console.log('todo ById', todoById);
}).catch((e) => console.log(e));
*/
var id = '5a7982828347ba28a8331d92';

User.find({
  _id: id
}).then((user) => {
  console.log('User', user);
});
User.findOne({
  _id: id
}).then((user) => {
  console.log('UserOne', user);
});
User.findById(id).then((user) => {
  if (!user) {
    console.log('Id not found!');
  }
  console.log('User by id', user);
}).catch((e) => console.log(e))
