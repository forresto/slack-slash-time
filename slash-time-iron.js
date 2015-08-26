var iron_worker = require('iron_worker');
var SlashTime = require('./slash-time');

console.log(iron_worker.params());
console.log(iron_worker.config());
console.log(iron_worker.taskId());

SlashTime(
  iron_worker.params(),
  iron_worker.config(), 
  function(data){
    console.log(data)
  }
);
