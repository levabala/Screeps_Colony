var TYPES = {
    TASK: -1,
    TRANSFER: 0,
    MOVE: 1,
    MINE: 2,
    CREATECREEP: 3,
    STORE: 4,
    PICKUP: 5,
    BUILD: 6,
    UPGRADECONTROLLER: 7
}

var TYPES_STRING = {
    0: "Transfer",
    1: "Move",
    2: "Mine",
    3: "CreateCreep",
    4: "Store",
    5: "PickUp",
    6: "Build",
    7: "UpgradeController"
}

var TYPES_STATIC = [2,6,7];

function Task(priority){
    var task = this;
    this.priority = priority;
    this.finished = false;
    this.type = TYPES.TASK;
    
    this.done = function(creep){
        task.finished = true;
        creep.memory["task"] = -1;
        creep.memory["taskData"] = {set:false};
        creep.say("Done")
    }
}

function Transfer(priority, creep){
    Task.apply(this, arguments);
    
    var task = this;
    this.creep = creep;
    this.type = TYPES.TRANSFER;
    
    this.execute = function(target){
        task.creep.memory["task"] = task.type;
        task.creep.moveTo(target);
        var res = task.creep.transfer(target, RESOURCE_ENERGY)
        if (res == 0)
            task.done(task.creep);
            
        creep.say("Transfer")
    }
}

function PickUp(priority, target){
    Task.apply(this, arguments);
    
    var task = this;
    this.target = target;
    this.type = TYPES.PICKUP;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type;
        creep.moveTo(task.target, {
            visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#fff',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1
                }
        });
        if (creep.pickup(task.target) == 0)
            task.done(creep);
    creep.say("PickUp")
    }
}

function Mine(priority, target){
    Task.apply(this, arguments);
    
    var task = this;
    this.target = target;
    this.type = TYPES.MINE;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type;
        if (!creep.pos.isNearTo(target))
            creep.moveTo(target);
        else {
            if (creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES)
                done(creep);
            else creep.drop(RESOURCE_ENERGY);
        }
        creep.say("Mine")
    }
}

function Move(priority, where){
    Task.apply(this, arguments);
    
    var task = this;
    this.where = where;
    this.type = TYPES.MOVE;
    
    this.execute = function(creep){
        task.creep.memory["task"] = task.type;
        if (creep.pos.isNearTo(where))
            done(creep);
        else creep.moveTo(where);
    }
}

function CreateCreep(priority, spawn, body){
    Task.apply(this, arguments);
    
    var task = this;
    this.spawn = spawn;
    this.body = body;
    this.type = TYPES.CREATECREEP;
    
    this.execute = function(){
        task.spawn.createCreep(task.body, null, {
            task: -1,
            taskData: {set: false}
        });
    }
}

function Explore(priority){
    Task.apply(this, arguments);
    
    var task = this;    
    this.type = TYPES.EXPLORE;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type;
        var room,exitDir;
        if (creep.memory.taskData.set){
            room = creep.memory.taskData.room;
            exitDir = creep.memory.taskData.exitDirection;
        }
        else {
            //here you need to generate "room"&"exitDirection", be lucky :)
            var toExplore = [];
            for (var r in Game.rooms){
                var rooms = Game.map.describeExits(r);
                for (var i in rooms)
                    if (toExplore.indexOf(rooms[i]) == -1)
                        toExplore.push(rooms[i])
            }
            var index = Math.floor(Math.random() * (toExplore.length-1));
            target = creep.memory.taskData["target"] = toExplore[index].name;            
        }        
        creep.move(creep.room.findExitTo(target));
    }   
}

function Build(priority, site){
    Task.apply(this, arguments);
    
    var task = this;
    this.site = site;
    this.type = TYPES.BUILD;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type; 
        if (creep.pos.isNearTo(task.site.pos)){
            var res = creep.build(site);
            console.log(res)
            if (res != 0)
                task.done(creep);
        }
        else creep.moveTo(site.pos);
        creep.say("Build")
    }
}

function UpgradeController(priority, controller){
    Task.apply(this, arguments);
    
    var task = this;
    this.controller = controller;
    this.type = TYPES.UPGRADECONTROLLER;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type;
        if (creep.pos.isNearTo(task.controller.pos)){
            var res = creep.upgradeController(task.controller);
            console.log(res)
            if (res != 0)
                task.done();
        }
        else creep.moveTo(task.controller);
        creep.say("Controller")
    }
}

module.exports = {
    Transfer: Transfer,
    Move: Move,
    Mine: Mine,
    CreateCreep: CreateCreep,
    PickUp: PickUp,
    Build: Build,
    UpgradeController: UpgradeController,
    TYPES: TYPES,
    TYPES_STRING: TYPES_STRING,
    TYPES_STATIC: TYPES_STATIC
};