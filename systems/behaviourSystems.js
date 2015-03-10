var ECS = ECS || {};
ECS.Systems = ECS.Systems || {};

// ECS.Systems.move = {
//   dependency: ["position", "associatedZone"],
//   callbacks: {},
//   entityCallbacks: {"yourTurn": "refreshPoints"},
//   init: function() {
//     var type = this.get("movement", "type");
//     if (!Game.Movement[type]) {
//       console.err("No movement of type: "+type);
//     }
//   },
//   refreshPoints: function() {
//     this.set("movement", "points", this.get("movement", "maxPoints"));
//   },
//   up: function() {
//     var infos = this.get("movement");
//     Game.Movement[infos.type].up(this);
//   },
//   down: function() {
//     var infos = this.get("movement");
//     Game.Movement[infos.type].down(this);
//   },
//   left: function() {
//     var infos = this.get("movement");
//     Game.Movement[infos.type].left(this);
//   },
//   right: function() {
//     var infos = this.get("movement");
//     Game.Movement[infos.type].right(this);
//   },
//   getTargetable: function() {
//     var paths = Game.Movement.getCanGoCoords(this);
//     this.set("movement", "paths", paths);
//     return Object.keys(paths);
//   },
//   execute: function(cbk, targetable, target) {
//     console.log("executing");
//     var paths = this.get("movement", "paths");
//     var path = [];
//     var curr = target[0]+"-"+target[1]+"-"+target[2];
//     while (curr !== "none") {
//       path.push(curr);
//       curr = paths[curr];
//     }
//     path.pop();
//     path.reverse();
//     this.s.move.path(path, cbk);
//   },
//   path: function(path, cbk) {
//     // console.log("follow path: ");
//     // console.log(path);
//     var cbkOnFinished = cbk;
//     var pathFunc = this.s.move.path;
//     var that = this;
//     var first = path.shift().split("-");
//     var firstObj = {"x": parseInt(first[0]), "y": parseInt(first[1]), "z": parseInt(first[2])};
//     Game.Movement.goToNoCheck(this, firstObj, 50, function() {
//       if (path.length > 0) {
//         pathFunc(path, cbkOnFinished);
//       } else {
//         cbkOnFinished();
//       }
//     });
//   },
// 
//   clean: function() {
//   }
// };
ECS.Systems.walk = {
  dependency: ["position", "associatedZone"],
  callbacks: {},
  entityCallbacks: {},
  execute: function(absCoord) {
    var mvtType = this.c.associatedZone.c.physicsRules.move;
    if (mvtType === "tile") {
      var voxCoord = Game.Graphics.getVoxPosFromAbsPos([1,1,1], absCoord[0], absCoord[1], absCoord[2]);
      if (Utils.arrayShallowEqual(voxCoord, this.c.position.vox)) {
        return null;
      }
      if (!this.c.movement.infiniteMvt) {
        var canGo = Game.Movement[mvtType].walk.getMovable(this, this.c.movement.currentPoints);
        var isIn = false;
        for (var i=0, l=canGo.length; i<l; i++) {
          if (Utils.arrayShallowEqual(voxCoord, canGo[i])) {
            isIn = true;
            break;
          }
        }
        if (!isIn) {
          console.warn("Can't go there, too far");
          return null;
        }
      }
      var path = Game.Movement[mvtType].walk.getPath(this, voxCoord[0], voxCoord[1], voxCoord[2]);
      if (path) {
        path.pop(); //the last coord is the actual position
        var that = this;
        var cbk = function() {
          if (path.length !== 0) {
            Game.Movement[mvtType].walk.go(that, path.pop(), cbk);
          }
        };
        Game.Movement[mvtType].walk.go(this, path.pop(), cbk);
      }
    }
  },
  getTargetable:function() {
    var mvtType = this.c.associatedZone.c.physicsRules.move;
    var targetable = Game.Movement[mvtType].walk.getMovable(this, this.c.movement.currentPoints);
    return targetable;
  }
};

ECS.Systems.uiControled = {
  dependency: [],
  callbacks: {"clickOnTerrain": "click"},
  entityCallbacks: {},
  // click: function() {
  // }
  click: function(coord) {
      console.log("DFDFA");
    //check what is clicked on to know what do do:move, talk, action,...
    var voxCoord = Game.Graphics.getVoxPosFromAbsPos([1, 1, 1], coord[0], coord[1], coord[2]);
    var uids = this.c.associatedZone.c.container.get(voxCoord[0], voxCoord[1], voxCoord[2]);
    if (!uids || uids.length === 0) {
      if (this.s.walk) {
        this.s.walk.execute(coord);
      }
    } else {
      for (var i=0, l=uids.length; i<l; i++) {
        var ent = this.c.associatedZone.c.entitiesList[uids[i]];
        if (ent.type === "living") {
          //TODO go next to it
          if (this.s.talk) {
            this.s.talk.execute(this.s.talk.getTargetable(), ent);
          }
        }
      }
    }
  }
};

ECS.Systems.aiControled = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {"yourTurn": "think"},
  init: function() {
  },
  think: function() {
    console.log(this.name+" is thinking...");
    this.s.aiControled.moveRandomly();
    this.em.send("turnFinished", this);
  },
  moveRandomly: function() {
    var dir = Math.floor(4*Math.random());
    switch (dir) {
      case 0:
        this.s.move.left();
        break;
      case 1:
        this.s.move.right();
        break;
      case 2:
        this.s.move.up();
        break;
      case 3:
        this.s.move.down();
        break;
      default:
        console.warn("Don't know this direction...");
    }
  },
  clean: function() {
  }
};

