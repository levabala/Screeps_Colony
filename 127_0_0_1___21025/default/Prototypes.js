RoomPosition.prototype.findShortestRoomRoute = function(array){
    var routes = [];
    for (var a in array)
        routes.push({
            route: Game.map.findRoute(Game.rooms[this.roomName], Game.rooms[array[a].roomName]),
            object: array[a]
        });
    routes.sort(function(p1,p2){
        if (p1.route.length > p2.route.length)
            return 1;
        if (p1.route.length < p2.route.length)
            return -1;
        return 0;
    });

    return routes[0];
}

RoomPosition.prototype.findClosestRoom = function(){
    var room = Game.rooms[this.roomName];
    var distances = [];
    for (var r in Game.rooms)
        if (r != this.roomName){
            var room2 = Game.rooms[r];            
            distances.push({
                distance: Game.map.getRoomLinearDistance(room.name, room2.name),
                room: room2 
            });
        }
    if (distances.length == 0)
        return null;
    
    distances.sort(function(d1,d2){
        if (d1.distance > d2.distance)
            return 1;
        if (d1.distance < d2.distance)
            return -1;
        return 0;
    });    
    return distances[0].room;
}

Game.CPURecords = {};
Game.startCPURecord = function(id){
    Game.CPURecords[id] = Game.cpu.getUsed();
}
Game.endCPURecord = function(id){
    var nowCPU = Game.cpu.getUsed();
    return nowCPU - Game.CPURecords[id];
}
Game.detailedCPU = {};
Game.printDetailedCPU = function(){
    var detailed = this.detailedCPU;
    var tab = '\t';    
    console.log("Detailed CPU usage:")
    for (var name in detailed){        
        var details = detailed[name];        
        var arr = objectToStringArray(details, tab, 2);   
        console.log(tab + name + ":");     
        for (var a in arr)
            console.log(arr[a]);
    }

    function objectToStringArray(obj, prefix, deep){
        var arr= []        
        for (var o in obj){
            if (typeof obj[o] == 'object'){
                arr.push(Array(deep + 1).join(prefix) + o + ":");
                arr = arr.concat(objectToStringArray(obj[o], prefix, deep+1));
            }
            else {
                if (typeof obj[o] == 'number')
                    obj[o] = Math.round(obj[o] * 10) / 10;
                arr.push(Array(deep + 1).join(prefix) + o + ": " + obj[o]);
            }
        }        
        return arr;
    }
}