	var Task = require("Task");

function Module(observer, restrictData, id){
    var module = this;
    this.observer = observer;
    this.restrictData = restrictData;
    this.tasks = {};
    this.tasksInProccess = {};
    if (!Memory["modules"])
        Memory["modules"] = {};
    if (!Memory["modules"][id])
        Memory["modules"][id] = {};
    this.memory = Memory["modules"][id];
    
    for (var k in Task.TYPES){
        this.tasks[Task.TYPES[k]] = [];
        this.tasksInProccess[Task.TYPES[k]] = 0;
    }
    
    this.generateTasks = function(){
        
    }
    
    this.performTasks = function(){
        
    }
    
    this.saveMemory = function(){
        
    }

    this.addTask = function(task){
        module.tasks[task.type].push(task);
    }
}

module.exports = Module;