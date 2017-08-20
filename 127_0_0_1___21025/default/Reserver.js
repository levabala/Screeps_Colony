function Reserver(observer, restrictData){
    this.reservePathesToSources = function(){
        var ROUTE_CELL_COST = 100;
        for (var s in observer.buildings.my.spawns){
            var spawn = observer.buildings.my.spawns[s];
            var sources = spawn.room.find(FIND_SOURCES);
            for (var ss in sources){
                var source = sources[ss];
                var params = {
                    ignoreCreeps: true,
                    maxRooms: 1,
                    costCallback: function(roomName, costs){
                        var room = Game.rooms[roomName];
                        for (var i in restrictData.notToBuild){
                            var pos = restrictData.notToBuild[i];
                            costs.set(pos.x, pos.y, ROUTE_CELL_COST);
                        }
                    }  
                }
                
                //to
                var routeTo = spawn.pos.findPathTo(source.pos, params)
                for (var r in routeTo)
                    restrictData.notToBuild.push(routeTo[r]);
                
                //from
                var routeFrom = spawn.pos.findPathTo(source.pos, params)
                for (var r in routeFrom)
                    restrictData.notToBuild.push(routeFrom[r]);
            }
        }
    }
    
    this.visualizeData = function(){
        for (var d in restrictData.notToBuild){
            var pos = restrictData.notToBuild[d];
            new RoomVisual(pos.roomName).circle(pos, {fill: 'darkgray'});
        }
        for (var d in restrictData.notToWalk){
            var pos = restrictData.notToWalk[d];
            new RoomVisual(pos.roomName).circle(pos, {fill: 'lightgray'});
        }
    }
}

module.exports = Reserver;