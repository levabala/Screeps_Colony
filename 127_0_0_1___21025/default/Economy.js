require("Prototypes");
var Module = require("Module");
var Task = require("Task");

function Economy(){
    Module.apply(this, arguments);
    var ec = this;
    
    var ENERGY_CAPACITY_BUFFER = 500;
    var CREEP_BODY = [MOVE, WORK, CARRY];
    
    this.needs = {
        energy: 0,
        energyCapacity: 0,
        creeps: 0,
    }
    
    this.generateTasks = function(){
        calculateNeeds();
        
        var capacityMap = [];
        for (var i in ec.observer.buildings.my.energyStorages){
            var storage = ec.observer.buildings.my.energyStorages[i];
            capacityMap[storage.id] = storage.energyCapacity;
        }
        
        generateUpgradeControllerTasks();
        generateBuildTasks();
        generatePickUpTasks();
        generateTransferTasks();
        generateMineTasks();
        generateCreateCreepTasks();
        
        function generateUpgradeControllerTasks(){
            for (var c in ec.observer.buildings.my.controllers){
                var controller = ec.observer.buildings.my.controllers[c];
                ec.addTask(new Task.UpgradeController(0.3, controller));
            }
        }
        
        function generateTransferTasks(){
            for (var i in ec.observer.myCreeps){
                var creep = ec.observer.myCreeps[i];
                if (_.sum(creep.carry) > 0 && Task.TYPES_STATIC.indexOf(creep.memory.task) == -1)
                    ec.addTask(new Task.Transfer(0.9, creep))
            }
        }
        
        function generatePickUpTasks(){
            var safeEnergy = ec.observer.dropped.energy.safe;
            var safeResources = ec.observer.dropped.resources.safe;
            for (var i in safeEnergy){
                var e = safeEnergy[i];
                var ranges = [];
                for (var s in ec.observer.buildings.my.energyStorages){
                    var range = e.pos.getRangeTo(ec.observer.buildings.my.energyStorages);
                    ranges.push(range);                    
                }
                var storage = e.pos.findClosestByRange(ec.observer.buildings.my.energyStorages, {ignoreCreeps: true});                

                var priority = 1;
                if (storage == null)
                    priority = 0.1;
                
                ec.addTask(new Task.PickUp(priority, e));
            }
        }
        
        function generateMineTasks(){
            var sources = ec.observer.sources.active.safe;
            for (var i in sources){
                var s = sources[i];
                var freeCells = 0;
                for (var x = -1; x <= 1; x++)
                    for (var y = -1; y <= 1; y++)
                        if (new RoomPosition(s.pos.x + x, s.pos.y + y, s.room.name).lookFor(LOOK_TERRAIN) == 'plain')
                            freeCells++;
                
                for (var c = 0; c < freeCells; c++)
                    ec.addTask(new Task.Mine(0.5, s))
            }
        }
        
        function generateCreateCreepTasks(){            
            if (ec.needs.creeps > 0)
                ec.addTask(new Task.CreateCreep(0.5, ec.observer.buildings.my.spawns[0], CREEP_BODY));
        }
        
        function generateBuildTasks(){
            
            extensionsBuild();
            
            //catch constructionsSites
            for (var i in ec.observer.buildings.my.constructionSites)
                ec.addTask(new Task.Build(0.5, ec.observer.buildings.my.constructionSites[i]));
            
            function extensionsBuild(){
                var startPos = ec.observer.buildings.my.spawns[0].pos;
                var place = searchBuildPlace(startPos, conditionFun, 400); //square 20x20                                

                if (place == null)
                    return;
                
                var room = Game.rooms[startPos.roomName];
                var res = room.createConstructionSite(place.x, place.y, STRUCTURE_EXTENSION);                

                function conditionFun(pos){
                    var positions = [
                        pos,
                        new RoomPosition(pos.x,pos.y-1,pos.roomName),
                        new RoomPosition(pos.x+1,pos.y,pos.roomName),
                        new RoomPosition(pos.x,pos.y+1,pos.roomName),
                        new RoomPosition(pos.x-1,pos.y,pos.roomName)
                    ];

                    for (var p in positions){
                        var objs = positions[p].look();
                        var structs = positions[p].lookFor(LOOK_STRUCTURES).length;
                        var sources = positions[p].lookFor(LOOK_SOURCES).length;
                        var sites = positions[p].lookFor(LOOK_CONSTRUCTION_SITES).length;
                        var minerals = positions[p].lookFor(LOOK_MINERALS).length;
                        var terrain = positions[p].lookFor(LOOK_TERRAIN);                        
                        if (
                            structs != 0 ||
                            sources != 0 ||
                            sites != 0 ||
                            minerals != 0 ||
                            terrain != 'plain') 
                            return false;
                        }
                    return true;
                }
            }
            
            function rampactsBuild(){
                
            }
            
            function wallsBuild(){
                
            }
            
            function storagesBuild(){
                
            }
            
            function searchBuildPlace(startPos, conditionFun, maxOps){
                for (var r = 0; r < maxOps; r++){
                    var res = searchSquare(startPos, r);
                    if (res != null)
                        return res;
                }
                return null;
                
                function searchSquare(p, round){
                    var radius = 4 + round * 2;
                    var x = p.x - radius / 2;
                    var y = p.y - radius / 2;
                    for (x = x; x <= p.x + radius / 2; x++){
                        var res = check(x,y);
                        if (res != null)
                            return res;
                    }
                    for (y = y; y <= p.y + radius / 2; y++){
                        var res = check(x,y);
                        if (res != null)
                            return res;
                    }
                    for (x = x; x >= p.x - radius / 2; x--){
                        var res = check(x,y);
                        if (res != null)
                            return res;
                    }
                    for (y = y; y <= p.y - radius / 2; y--){
                        var res = check(x,y);
                        if (res != null)
                            return res;
                    }
                    
                    //if nothing found
                    return null;
                    
                    function check(x,y){
                        var pos = new RoomPosition(x,y,p.roomName);
                        for (var a in ec.restrictData.notToBuild){
                            var ppos = ec.restrictData.notToBuild[a];
                            if (ppos.x == x && ppos.y == y && ppos.roomName == p.roomName)
                                return null;
                        }
                            
                        if (conditionFun(pos))
                            return pos;
                        else return null;
                    }
                }
            }
        }
    }
    
    this.performTasks = function(){
        for (var t in ec.tasks)
            ec.tasks[t].sort(function(t1, t2){
                if (t1.priority > t2.priority)
                    return 1;
                if (t1.priority < t2.priority)
                    return -1;
                return 0;
            })
        
        var freeCreeps = ec.observer.myCreeps.slice();
        
        var c1 = performCreateCreepTasks();
        var c2 = performPickUpTasks();
        var c3 = performTransferTasks();
        var c4 = performMineTasks();
        var c5 = performBuildTasks();
        var c6 = performUpgradeControllerTasks();
            
        ec.tasksInProccess[Task.TYPES.CREATECREEP] += c1;
        ec.tasksInProccess[Task.TYPES.PICKUP] += c2;
        ec.tasksInProccess[Task.TYPES.TRANSFER] += c3;
        ec.tasksInProccess[Task.TYPES.MINE] += c4;
        ec.tasksInProccess[Task.TYPES.BUILD] += c5;
        ec.tasksInProccess[Task.TYPES.UPGRADECONTROLLER] += c6;
        
        for (var c in freeCreeps){
            freeCreeps[c].memory.task = -1;
            freeCreeps[c].say("Nothing")
            
            freeCreeps[c].move(Math.floor(Math.random() * 7) + 1);
        }
        
        function bookCreep(creep){
            var index = freeCreeps.indexOf(creep);
            if (index != -1)
                freeCreeps.splice(index, 1)
        }
        
        function performMineTasks(){
            var mineTasks = ec.tasks[Task.TYPES.MINE];
            var counter = 0;
            for (var i in mineTasks){
                var task = mineTasks[i];
                var closestCreep = task.target.pos.findClosestByPath(freeCreeps);
                if (closestCreep == null)
                    continue;
                task.execute(closestCreep);
                bookCreep(closestCreep);
                counter++;
            }
            return counter;
        }
        
        function performPickUpTasks(){
            var capacityMap = {};
            for (var i in ec.observer.myCreeps)
                capacityMap[ec.observer.myCreeps[i].id] = ec.observer.myCreeps[i].carryCapacity - _.sum(ec.observer.myCreeps[i].carry);
            
            var pickUpTasks = ec.tasks[Task.TYPES.PICKUP];
            pickUpTasks.sort(function(p1, p2){
                if (p1.amount > p2.amount)
                    return 1;
                if (p1.amount < p2.amount)
                    return -1;
                return 0;
            });
            
            var amountMap = {};
            for (var i in pickUpTasks)
                amountMap[pickUpTasks[i].target.id] = pickUpTasks[i].target.amount;
            
            var counter = 0;
            for (var i in pickUpTasks){
                var task = pickUpTasks[i];
                while(amountMap[task.target.id] > 0 && freeCreeps.length > 0){
                    var closestCreep = task.target.pos.findClosestByPath(freeCreeps, {filter: function(creep){
                        return capacityMap[creep.id] > 0 && Task.TYPES_STATIC.indexOf(creep.memory.task) == -1;
                    }});
                    if (closestCreep == null){
                        var rooms = {};
                        for (var c in freeCreeps)
                            if (freeCreeps[c].room.name != task.target.room.name)
                                rooms[freeCreeps[c].room.name] = freeCreeps[c].room;
                        var roomsArray = [];
                        for (var r in rooms)
                            roomsArray.push(rooms[r]);
                        var closestRoom = task.target.pos.findClosestRoom(roomsArray);
                        for (var c in freeCreeps)
                            if (freeCreeps[c].room.name == closestRoom.name){
                                closestCreep = freeCreeps[c];                
                                break;
                            }        
                        if (closestCreep == null)
                            break;
                    }                     
                    task.execute(closestCreep);
                    var amount = amountMap[task.target.id];
                    amountMap[task.target.id] -= capacityMap[closestCreep.id];
                    capacityMap[closestCreep.id] -= amount;
                    
                    bookCreep(closestCreep);
                    counter++;
                }
            }
            
            return counter;
        }
        
        function performTransferTasks(){
            var capacityMap = {}; 
            var energyStorages = ec.observer.buildings.my.energyStorages;
            for (var i in energyStorages)
                capacityMap[energyStorages[i].id] = energyStorages[i].energyCapacity - energyStorages[i].energy;
            
            var transferTasks = ec.tasks[Task.TYPES.TRANSFER];
            var counter = 0;
            for (var i in transferTasks){
                var task = transferTasks[i];
                if (!task.creep){
                    console.log("no creep")
                    continue;
                }
                var storages = ec.observer.buildings.my.energyStorages;
                var closestStorage = task.creep.pos.findClosestByPath(storages, {filter: function(storage){
                    return capacityMap[storage.id] > _.sum(task.creep.carry);
                }});    
                if (closestStorage == null){
                    var rooms = {};                    
                    for (var c in storages)
                        if (storages[c].room.name != task.creep.room.name)
                            rooms[storages[c].room.name] = storages[c].room;
                    var roomsArray = [];
                    for (var r in rooms)
                        roomsArray.push(rooms[r]);
                    var closestRoom = task.creep.pos.findClosestRoom(roomsArray);
                    if (closestRoom == null)
                        break;
                    
                    for (var c in storages)
                        if (storages[c].room.name == closestRoom.name){
                            closestStorage = storages[c];                
                            break;
                        }        
                    if (closestStorage == null)
                        break;
                }
                task.execute(closestStorage);
                capacityMap[closestStorage.id] -= _.sum(task.creep.carry);                
                
                bookCreep(task.creep);
                counter++;
            }            
            return counter;
        }
        
        function performMoveTasks(){
            
        }
        
        function performUpgradeControllerTasks(){
            var upgradeTasks = ec.tasks[Task.TYPES.UPGRADECONTROLLER];
            var creepsPerTask = Math.floor(freeCreeps.length / upgradeTasks.length);
            var counter = 0;
            for (var i in upgradeTasks){
                var task = upgradeTasks[i];
                for (var ii = 0; ii < creepsPerTask; ii++){
                    var closestCreep = task.controller.pos.findClosestByPath(freeCreeps, {filter: function(creep){
                        return creep.carry[RESOURCE_ENERGY] > 0;
                    }})
                    if (closestCreep == null)
                        break;
                    task.execute(closestCreep);
                    bookCreep(closestCreep);
                    counter++;
                }
            }
            return counter;
        }
        
        function performBuildTasks(){
            var buildTasks = ec.tasks[Task.TYPES.BUILD];
            var creepsPerTask = Math.floor(freeCreeps.length / buildTasks.length);
            var counter = 0;
            for (var i in buildTasks){
                var task = buildTasks[i];
                for (var ii = 0; ii < creepsPerTask; ii++){
                    var closestCreep = task.site.pos.findClosestByPath(freeCreeps, {filter: function(creep){
                        return creep.carry[RESOURCE_ENERGY] > 0;
                    }})
                    if (closestCreep == null)
                        break;
                    task.execute(closestCreep);
                    bookCreep(closestCreep);
                    counter++;
                }
            }
            return counter;
        }
        
        function performCreateCreepTasks(){
            var createCreepTasks = ec.tasks[Task.TYPES.CREATECREEP];
            var counter = 0;
            for (var i in createCreepTasks){
                var task = createCreepTasks[i];
                var spawns = ec.observer.buildings.my.spawns.slice();
                spawns.sort(function(s1, s2){
                    if (s1.energy > s2.energy)
                        return -1;
                    if (s1.energy < s2.energy)
                        return 1;
                    return 0;
                });
                task.execute(spawns[0]);
                counter++;
            }
            return counter;
        }
    }
    
    function calculateNeeds(){
        ec.needs.creeps = calcCreepsNeed();
        ec.needs.energy = calcEnergyNeed();
        ec.needs.energyCapacity = calcCapacityNeed();
    }
    
    function calcCreepsNeed(){
        return ec.observer.sources.active.safe.length * 7 - ec.observer.myCreeps.length;
    }
    
    function calcEnergyNeed(){
        return ec.needs.creeps * (50 + 150 + 50);
    }
    
    function calcCapacityNeed(){
        var need = ec.observer.totalEnergy - ec.observer.totalCapacity + ENERGY_CAPACITY_BUFFER;
        if (need < 0) need = 0
        return need;
    }            
}

module.exports = Economy;