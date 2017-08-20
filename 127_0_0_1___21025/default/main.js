console.log('----------- TICK ----------- ')
console.log("CPU:");
console.log("\tLimit:", Game.cpu.limit)
console.log("\tTickLimit:", Game.cpu.tickLimit)
console.log("\tBucket:", Game.cpu.bucket)

var usageNew = 0,usage = 0,delta = 0;

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

Game.startCPURecord("observer")
Game.detailedCPU["Observer"] = {};
observer.findAll();
console.log("Observer:")
console.log("\tDropped:", observer.dropped.energy.safe.length + "/" + observer.dropped.energy.safeTotal);
console.log("\tEnergy:", observer.totalEnergy);
console.log("\tCapacity:", observer.totalCapacity);
console.log("\tCapacityPending:", observer.totalCapacityPending);
console.log("\tCreeps:", observer.myCreeps.length);

var cpu = Game.endCPURecord("observer")
Game.detailedCPU["Observer"]["Total"] = cpu; 

reserver.reservePathesToSources();

economy.generateTasks();
economy.performTasks();
console.log("Tasks:")
for (var type in economy.tasks)
    console.log('\t'+Task.TYPES_STRING[type] + ":", economy.tasksInProccess[type] + '/' + economy.tasks[type].length)

economy.saveMemory();


Game.printDetailedCPU();

//now visualize
//reserver.visualizeData();