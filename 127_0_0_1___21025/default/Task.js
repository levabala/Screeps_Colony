var TYPES = {
    TASK: -1,
    TRANSFER: 0,
    MOVE: 1,
    MINE: 2,
    CREATECREEP: 3,
    STORE: 4,
    PICKUP: 5,
    BUILD: 6,
    UPGRADECONTROLLER: 7,
    EXPLORE: 8
}

var TYPES_STRING = {
    "-1": "Idle",
    0: "Transfer",
    1: "Move",
    2: "Mine",
    3: "CreateCreep",
    4: "Store",
    5: "PickUp",
    6: "Build",
    7: "UpgradeController",
    8: "Explore"
}

var SAY = false;

var TYPES_STATIC = [2,6,7,8];

function Task(priority){
    var task = this;
    this.priority = priority;
    this.finished = false;
    this.type = TYPES.TASK;
    
    this.done = function(creep){
        task.finished = true;
        creep.memory["task"] = -1;
        creep.memory["taskData"] = {set:false};
        if (SAY) creep.say("Done")
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
            
        if (SAY) creep.say("Transfer")
    }
}

function PickUp(priority, target){
    Task.apply(this, arguments);
    
    var task = this;
    this.target = target;
    this.type = TYPES.PICKUP;
    
    this.execute = function(creep){
        creep.memory["task"] = task.type;
        creep.memory.taskData["lastTargetId"] = task.target.id;
        if (creep.room.name == task.target.room.name)
            creep.moveTo(task.target);
        else {
            var exitDir = Game.map.findExit(creep.room, task.target.room);
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
        }

        if (creep.pickup(task.target) == 0)
            task.done(creep);
        if (SAY) creep.say("PickUp")
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
        if (SAY) creep.say("Mine")
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
        var nearRoomName,targetRoomName,exitDir,stayTimer;
        if (creep.memory.taskData.set){
            nearRoomName = creep.memory.taskData.nearRoomName;
            targetRoomName = creep.memory.taskData.targetRoomName;
            exitDir = creep.memory.taskData.exitDir;             
            stayTimer = creep.memory.taskData.stayTimer;
        }
        else {            
            var toExplore = [];
            for (var r in Game.rooms){
                var rooms = Game.map.describeExits(r);
                for (var i in rooms)
                    toExplore.push({
                        nearRoomName: r,
                        targetRoomName: rooms[i],
                        exitDir: i
                    });    
            }
            var index = Math.floor(Math.random() * (toExplore.length-1));
            var explore = toExplore[index];
            nearRoomName = creep.memory['taskData']['nearRoomName'] = explore.nearRoomName;            
            targetRoomName = creep.memory['taskData']['targetRoomName'] = explore.targetRoomName;            
            exitDir = creep.memory['taskData']['exitDir'] = explore.exitDir;
            stayTimer = creep.memory['taskData']['stayTimer'] = 50;
            creep.memory.taskData.set = true;            
        }        
        if (creep.room.name == targetRoomName || !Game.rooms[nearRoomName]){            
            if (stayTimer <= 0)
                task.done(creep);
            //else console.log("STAY", stayTimer)
            stayTimer--;
            creep.memory['taskData']['stayTimer'] = stayTimer;
            return;
        }

        var exit;
        if (creep.room.name == nearRoomName){
            var exits = Game.map.describeExits(creep.room.name);       
            exitDir = Game.map.findExit(creep.room.name, targetRoomName);
            exit = creep.pos.findClosestByRange(exitDir);            
        }
        else {
            exit = creep.pos.findClosestByRange(creep.room.findExitTo(Game.rooms[nearRoomName]));            
        }
        creep.moveTo(exit);
        /*console.log("room:", creep.room.name);
        console.log("targetRoom:", targetRoomName);
        console.log("nearRoom:", nearRoomName);
        console.log("exitDir", exitDir)
        console.log("exit", exit)*/
        if (SAY) creep.say("Explore")
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
            if (res != 0)
                task.done(creep);
        }
        else creep.moveTo(site.pos);
        if (SAY) creep.say("Build")
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
            if (res != 0)
                task.done();
        }
        else creep.moveTo(task.controller);
        if (SAY) creep.say("Controller")
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
    Explore: Explore,
    TYPES: TYPES,
    TYPES_STRING: TYPES_STRING,
    TYPES_STATIC: TYPES_STATIC
};