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