var Game = Game || {};
Game.Movement = Game.Movement || {};

Game.Movement.tile = {
  //walking, with tiles movements
  walk: {
    go: function(ent, voxCoord, cbk) {
      Game.Movement.goToVox(ent, voxCoord[0], voxCoord[1], voxCoord[2], 50, cbk);
    },
    getPath: function(ent, x, y, z) {
      // Implementation of the A* algorithm
      var path = [];
      
      var zone = ent.c.associatedZone;
      var map = zone.c.container;
      var goal = [x, y, z];
      var current, neighbours, next, priority;

      var heuristic = function(a, b) {
        // Manhattan distance on a square grid
        return Math.abs(a[0] - b[0]) + Math.abs(a[2] - b[2]);
      };

      var frontier = new PriorityQueue({comparator: function(a, b) {
        return a.prio - b.prio;
      }});
      var cameFrom = {};
      var costSoFar = {};
      var startString = JSON.stringify(ent.c.position.vox);
      frontier.queue({val: ent.c.position.vox, valStr: startString, prio: 0});
      cameFrom[startString] = true;
      costSoFar[startString] = 0;
      
      while (frontier.length !== 0) {
        current = frontier.dequeue();
        if (Utils.arrayShallowEqual(current.val, goal)) {
          break;
        }
        neighbours = this.getMovableNeighbours(ent, current.val[0], current.val[1], current.val[2], zone, map);
        for (var i=0; i<neighbours.length; i++) {
          next = neighbours[i];
          var nextString = JSON.stringify(next);
          var newCost = costSoFar[current.valStr] + 1; //so far mvt cost is always 1
          if (!cameFrom[nextString] || newCost < costSoFar[nextString]) {
            costSoFar[nextString] = newCost;
            priority = newCost + heuristic(goal, next);
            frontier.queue({val: next, valStr: nextString, prio: priority});
            cameFrom[nextString] = current.val;
          }
        }
      }

      if (cameFrom[JSON.stringify(goal)] === undefined) {
        console.debug("Couldn't find a path to: "+goal); //TODO try to go the closest
        return null;
      }
      //Construct path
      current = goal;
      path.push(current);
      while (!Utils.arrayShallowEqual(current, ent.c.position.vox)) {
        current = cameFrom[JSON.stringify(current)];
        path.push(current);
      }
      return path;
    },
    getMovable: function(ent, nbMvt) {
      var zone = ent.c.associatedZone;
      var map = zone.c.container;

      var result = [];
      var frontier = [ent.c.position.vox];
      var startString = JSON.stringify(ent.c.position.vox);
      var visited = {};
      visited[startString] = true;
      var costSoFar = {};
      costSoFar[startString] = 0;
  
      while (frontier.length !== 0) {
        var current = frontier.shift();
        var currentString = JSON.stringify(current);
        if (costSoFar[currentString] >= nbMvt) {
          continue;
        }
        var neighbours = this.getMovableNeighbours(ent, current[0], current[1], current[2], zone, map);
        for (var i=0; i<neighbours.length; i++) {
          var next = neighbours[i];
          var nextString = JSON.stringify(next);
          var newCost = costSoFar[currentString] + 1;
          if (!visited[nextString]) {
            frontier.push(next);
            visited[nextString] = true;
            costSoFar[nextString] = newCost;
            result.push(next);
          }
        }
      }
      return result;
    },
    getMovableNeighbours: function(ent, x, y, z, zone, map) {
      var result = [];
      //right
      var res = this.canMoveTo(ent, y, x+1, z, zone, map);
      if (res !== null) {
        result.push([x+1, res, z]);
      }
      //left
      res = this.canMoveTo(ent, y, x-1, z, zone, map);
      if (res !== null) {
        result.push([x-1, res, z]);
      }
      //up
      res = this.canMoveTo(ent, y, x, z-1, zone, map);
      if (res !== null) {
        result.push([x, res, z-1]);
      }
      //down
      res = this.canMoveTo(ent, y, x, z+1, zone, map);
      if (res !== null) {
        result.push([x, res, z+1]);
      }
      return result;
    },

    canMoveTo: function(ent, fromY, x, z, zone, map) {
      //check same level
      if (this.canStandAt(ent, x, fromY, z, zone, map)) {
        return fromY;
      }
      //check other levels
      var lvl = Math.floor((ent.c.size[1]/2) - 0.1);
      for (var i=1; i<=lvl; i++) {
        //check up
        if (this.canStandAt(ent, x, fromY+i, z, zone, map)) {
          return fromY+i;
        }
        //check down
        if (this.canStandAt(ent, x, fromY-i, z, zone, map)) {
          return fromY-i;
        }
      }
      // console.log("Nope, can't go there or climb from: "+fromY+" TO: "+x+","+z);
      return null;
    },
    canStandAt: function(ent, x, y, z, zone, map) {
      if (!map.inRange(x, y-1, z)) {
        return false;
      }
      if (!zone.s.physicsRules.canBeAt(ent.uid, ent.c.size, ent.c.consistence, x, y, z)) {
        return false;
      }
      var ground = map.get(x, y-1, z);
      var canBeAt = zone.s.physicsRules.canBeAt;
      for (var i=0; i<ground.length; i++) {
        var groundEnt = zone.c.entitiesList[ground[i]];
        if (groundEnt.c.consistence >= 0.5) {
          return true;
        }
      }
      return false;
    }
  },

  fly: function() {
  }
};

Game.Movement.free = {
  walk: function() {
  }
};

Game.Movement.goToVox = function(ent, x, y, z, speed, cbk) {
    console.log(ent.name+" will try to go to: "+x+","+y+","+z);
    if (ent.c.associatedZone.s.physicsRules.canBeAt(ent.uid, ent.c.size, ent.c.consistence, x, y, z)) {
      var currPos = ent.c.position.vox;
      var newPos = [x, y, z];
      ent.send("moved", currPos, newPos); //updates stored in zone
      // ent.em.send("moved", currPos, newPos); //updates topMoveToo
      ent.c.position.vox = newPos;
      ent.c.isDirty.position = true;

      var absPos = ent.c.position.abs;
      var newAbsPos = Game.Graphics.getAbsPosFromVoxPos(ent.c.size, x, y, z);
      console.log("go from "+absPos+" to "+newAbsPos);
      // Do some smooth animation
      if (speed) {
        ent.c.movement.isMoving = true;
        new TWEEN.Tween(ent.c.position.abs)
          .to(newAbsPos, 10000 / speed) 
          .onUpdate(function() {
            ent.c.isDirty.position = true;
          })
          .onComplete(function() {
            ent.c.movement.isMoving = false;
            if (cbk) {
              cbk();
            }
          })
          .start();
      } else {
        ent.c.position.abs = newAbsPos;
      }
      return true;
    } else {
      return false;
    }
};














Game.Movement.goToNoCheck = function(ent, pos, speed, cbk) {
  // console.log("start go from " + ent.get("position").y + " to " +  pos.y);
  ent.em.send("moved", ent, ent.get("position"), pos); //updates stored in zone
  ent.send("moved", ent.get("position"), pos); //updates topMoveToo
  var currPos = ent.get("position");
  ent.set("movement", "moving", true);
  var mvtPts = ent.get("movement", "points");
  ent.set("movement", "points", mvtPts - 1);
  new TWEEN.Tween(ent.get("position"))
    .to(pos, 10000 / speed) 
    .onUpdate(function() {
      ent.set("position", {"x": this.x, "y": this.y, "z": this.z});
    })
    .onComplete(function() {
      ent.set("movement", "moving", false);
      ent.set("position", "coordString", this.x+"-"+this.y+"-"+this.z);
      if (cbk) {
        cbk();
      }
    })
    .start();
  // console.log("end go from " + ent.get("position").y + " to " +  pos.y);
};

Game.Movement.getCanGoCoords = function(ent) {
  console.groupCollapsed("calculate canGoCoords");
  var zone = ent.get("associatedZone", "value");
  var map = zone.get("associatedContainer", "value");
  var mvtType = ent.get("movement", "type");
  var mvtPoints = ent.get("movement", "points");
  
  //Dijkstra (without the priority queue)
  var first = {"x": ent.get("position").x, "y": ent.get("position").y, "z": ent.get("position").z};
  console.log("For ent at: "+first.x+"-"+first.y+"-"+first.z);
  var frontier = [first];
  var cameFrom = {};
  var costSoFar = {};
  cameFrom[first.x+"-"+first.y+"-"+first.z] = "none";
  costSoFar[first.x+"-"+first.y+"-"+first.z] = 0;
  while (frontier.length>0) {
    var current = frontier.shift();
    var currentS = current.x+"-"+current.y+"-"+current.z;
    if (costSoFar[currentS] >= mvtPoints){
      continue;
    }
    var neighbours = Game.Movement.getMovableNeighbours(ent, current, mvtType, zone, map);
    for (var i=0; i<neighbours.length; i++) {
      var s = neighbours[i].x+"-"+neighbours[i].y+"-"+neighbours[i].z;
      var newCost = costSoFar[currentS] + 1; //mvt cost is always 1
      if (!costSoFar[s] || newCost < costSoFar[s]) {
        costSoFar[s] = newCost;
        frontier.push(neighbours[i]);
        cameFrom[s] = currentS;
      }
    }
  }
  console.log(cameFrom);
  console.groupEnd("calculate canGoCoords");
  return cameFrom;
};

// Game.Movement.getMovableNeighbours = function(ent, pos, mvtType, zone, map) {
//   result = [];
//   //right
//   var res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x+1, pos.z, zone, map);
//   if (res !== null) {
//     result.push({"x": pos.x+1, "y": res, "z": pos.z});
//   }
//   //left
//   res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x-1, pos.z, zone, map);
//   if (res !== null) {
//     result.push({"x": pos.x-1, "y": res, "z": pos.z});
//   }
//   //up
//   res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x, pos.z-1, zone, map);
//   if (res !== null) {
//     result.push({"x": pos.x, "y": res, "z": pos.z-1});
//   }
//   //down
//   res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x, pos.z+1, zone, map);
//   if (res !== null) {
//     result.push({"x": pos.x, "y": res, "z": pos.z+1});
//   }
//   return result;
// };

Game.Movement.walk = {
  up: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x;
    var z = pos.z - 1;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.z = z;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  down: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x;
    var z = pos.z + 1;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.z = z;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  left: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x - 1;
    var z = pos.z;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.x = x;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  right: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x + 1;
    var z = pos.z;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.x = x;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },

  // canMoveTo: function(ent, pos, x, z, zone, map) {
  //   //check same level
  //   if (Game.Movement.walk.canStandAt(ent, x, pos.y, z, zone, map)) {
  //     return pos.y;
  //   }
  //   //check other levels
  //   var lvl = Math.floor((ent.get("size", "value")[1]/2) - 0.1);
  //   for (var i=1; i<=lvl; i++) {
  //     //check up
  //     if (Game.Movement.walk.canStandAt(ent, x, pos.y+i, z, zone, map)) {
  //       return pos.y+i;
  //     }
  //     //check down
  //     if (Game.Movement.walk.canStandAt(ent, x, pos.y-i, z, zone, map)) {
  //       return pos.y-i;
  //     }
  //   }
  //   console.log("Nope, can't go there or climb");
  //   return null;
  // },

  // canStandAt: function(ent, x, y, z, zone, map) {
  //   if (x<0 || y-1<0 || z<0 || x>=map.sizeX || y>=map.sizeY || z>=map.sizeZ) {
  //     return false;
  //   }
  //   var ground = map.get(x, y-1, z);
  //   var canBeAt = zone.s.physicsRules.canBeAt;
  //   for (var i=0; i<ground.length; i++) {
  //     var groundEnt = Game.e.entities[ground[i]];
  //     if (groundEnt.get("consistence", "value") === 1) {
  //       if (canBeAt(ent, {"x":x, "y":y, "z":z})) {
  //         return true;
  //       }
  //     }
  //   }
  //   return false;
  // }
};

