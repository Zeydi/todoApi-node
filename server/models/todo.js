var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

/*var otherTodo = new Todo({
  text: 'Something to do'
});
otherTodo.save().then((doc) =>{
  console.log(JSON.stringify(doc, undefined, 2))
}, (e) =>{
  console.log('Unable to save', e);
});*/
module.exports = {Todo};
