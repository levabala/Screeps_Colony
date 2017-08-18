console.log('----------- TICK ----------- ')

var Task = require("Task");
var Observer = require("Observer");
var Economy = require("Economy");
var Combat = require("Combat");
var RestrictData = require("RestrictData");
var Reserver = require("Reserver"); 

var observer = new Observer();
var restrictData = new RestrictData();
var reserver = new Reserver(observer, restrictData);
var economy = new Economy(observer, restrictData);
var combat = new Combat(observer, restrictData);

observer.findAll();
console.log("Observer:")
console.log("\tEnergy:", observer.totalEnergy);
console.log("\tCapacity:", observer.totalCapacity);
console.log("\tCapacityPending:", observer.totalCapacityPending);
console.log("\tCreeps:", observer.myCreeps.length);

reserver.reservePathesToSources();

economy.generateTasks();
economy.performTasks();
console.log("Tasks:")
for (var type in economy.tasks)
    console.log('\t'+Task.TYPES_STRING[type] + ":", economy.tasksInProccess[type] + '/' + economy.tasks[type].length)



//now visualize
//reserver.visualizeData();