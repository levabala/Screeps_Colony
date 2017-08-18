var ENERGY_CAPACITY = {
    STRUCTURE_CONTAINER: CONTAINER_CAPACITY,
    STRUCTURE_STORAGE: STORAGE_CAPACITY,
    STRUCTURE_SPAWN: SPAWN_ENERGY_CAPACITY,
    STRUCTURE_EXTENSION: EXTENSION_ENERGY_CAPACITY, //let say that we won't reach 7th or 8th level :)
}

function Observer(){
    var obs = this;
    this.myCreeps = [];
    this.rooms = [];
    this.creepsByTask = {};
    for (var c in Game.creeps){
        var creep = Game.creeps[c];
        this.myCreeps.push(creep);
        
    }
    
    this.hostileCreeps = [];
    this.buildings = {
        my: {
            spawns: [],
            structures: [],
            energyStorages: [],
            constructionSites: [],
            controllers: []
        },
        enemy: {
            spawns: [],
            structures: []
        }
    }
    this.sources = {
        active: {
            dangerous: [],
            safe: []
        },
        inactive: {
            dangerous: [],
            safe: []
        }
    }
    this.dropped = {
        energy: {
            safe: [],
            dangerous: []
        },
        resources: {
            safe: [],
            dangerous: []
        }
    }
    this.totalEnergy = 0;
    this.totalCapacity = 0;
    this.totalCapacityPending = 0;
    
    this.findAll = function(){
        for (var i in Game.rooms){
            var room = Game.rooms[i];
            obs.rooms.push(room);
            obs.hostileCreeps = obs.hostileCreeps.concat(room.find(FIND_HOSTILE_CREEPS));
            obs.buildings.my.spawns = obs.buildings.my.spawns.concat(room.find(FIND_MY_SPAWNS));
            obs.buildings.my.structures = obs.buildings.my.structures.concat(room.find(FIND_MY_STRUCTURES));
            obs.buildings.my.controllers = obs.buildings.my.controllers.concat(room.find(FIND_MY_STRUCTURES, {filter: function(struct){
                return struct.structureType == STRUCTURE_CONTROLLER;
            }}));
            obs.buildings.my.constructionSites = obs.buildings.my.constructionSites.concat(room.find(FIND_MY_CONSTRUCTION_SITES));
            obs.buildings.my.energyStorages = obs.buildings.my.energyStorages.concat(room.find(FIND_MY_STRUCTURES, {filter: function(struct){
                return struct.energyCapacity != null;
            }}));
            obs.buildings.my.energyStorages.sort(function(s1, s2){
                var spaceLeft1 = s1.energyCapacity - s1.energy;
                var spaceLeft2 = s2.energyCapacity - s2.energy;
                if (spaceLeft1 < spaceLeft2)
                    return -1;
                if (spaceLeft1 > spaceLeft2)
                    return 1;
                return 0;
            })
            obs.buildings.enemy.spawns = obs.buildings.enemy.spawns.concat(room.find(FIND_HOSTILE_SPAWNS));
            obs.buildings.enemy.structures = obs.buildings.enemy.structures.concat(room.find(FIND_HOSTILE_STRUCTURES));
            
            //energy calculating
            for (var c in obs.myCreeps)
                if (obs.myCreeps[c].carry[RESOURCE_ENERGY])
                    obs.totalEnergy += obs.myCreeps[c].carry[RESOURCE_ENERGY];
            for (var i in obs.buildings.my.energyStorages){
                var struct = obs.buildings.my.energyStorages[i];
                obs.totalEnergy += struct.energy;
                obs.totalCapacity += struct.energyCapacity;
            }
            obs.totalCapacityPending = obs.totalCapacity;
            for (var i in obs.buildings.my.constructionSites){
                var site = obs.buildings.my.constructionSites[i];
                if (ENERGY_CAPACITY[site.structureType])
                    obs.totalCapacityPending += ENERGY_CAPACITY[site.structureType];
            }
            
            //sources sorting
            var sources = room.find(FIND_SOURCES);
            for (var i in sources)
                if (isSafe(sources[i].pos))
                    if (sources[i].energy > 0)
                        obs.sources.active.safe.push(sources[i]);
                    else
                        obs.sources.inactive.safe.push(sources[i]);
                else 
                    if (sources[i].energy > 0)
                        obs.sources.active.dangerous.push(sources[i]);
                    else
                        obs.sources.inactive.dangerous.push(sources[i]);
                        
            //dropped resources
            var droppedResources = room.find(FIND_DROPPED_RESOURCES);
            console.log("Dropped:", droppedResources.length)
            for (var i in droppedResources){
                var dropped = droppedResources[i];
                if (dropped.resourceType == RESOURCE_ENERGY)
                    if (isSafe(dropped.pos))
                        obs.dropped.energy.safe.push(dropped);
                    else
                        obs.dropped.energy.dangerous.push(dropped);
                else         
                    if (isSafe(dropped.pos))
                        obs.dropped.resources.safe.push(dropped);
                    else
                        obs.dropped.resources.dangerous.push(dropped);
            }
        }
    }
    
    function isSafe(pos){
        return pos.findInRange(FIND_HOSTILE_CREEPS, 5).length == 0 && pos.findInRange(FIND_STRUCTURES, 7, {filter: function(struct){
            return struct.structureType == STRUCTURE_KEEPER_LAIR;
        }}).length == 0;;
    }
}

module.exports = Observer;









