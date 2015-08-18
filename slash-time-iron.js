var iron_worker = require('iron_worker');
var SlashTime = require('./slash-time');

// var ironConfig = require('iron.json');
// var worker = new iron_worker.Client({
//   token: ironConfig.token, 
//   project_id: ironConfig.project_id
// });

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