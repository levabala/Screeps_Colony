console.log('----------- TICK ----------- ')

var Task = require("Task");
var Observer = require("Observer");
var Economy = require("Economy");
var Combat = require("Combat");
var RestrictData = require("RestrictData");
var Reserver = require("Reserver"); 

var observer = new Observer();
var restrictData = new RestrictData();
var reserver = new Reserver(observer, restrictData, "reserver");
var economy = new Economy(observer, restrictData, "economy");
var combat = new Combat(observer, restrictData, "combat");

observer.findAll();
console.log("Observer:")
console.log("\tDropped:", observer.dropped.energy.safe.length + "/" + observer.dropped.energy.safeTotal);
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

economy.saveMemory();

//now visualize
//reserver.visualizeData();