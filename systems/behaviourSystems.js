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
  execute: function(coord, onStart, onFinish) {
    if (!onFinish) {
      onFinish = function() {
        console.debug("Action finished");
      };
    }
    var mvtType = this.c.associatedZone.c.physicsRules.move;
    if (mvtType === "tile") {
      // Then coord is voxCoord
      if (Utils.arrayShallowEqual(coord, this.c.position.vox)) {
        return null;
      }
      //Can I really go there?
      var targetable = this.s.walk.getTargetable();
      var isIn = false;
      for (var i=0, l=targetable.length; i<l; i++) {
        if (Utils.arrayShallowEqual(coord, targetable[i])) {
          isIn = true;
          break;
        }
      }
      if (!isIn) {
        console.warn(JSON.stringify(coord)+ " is not in the targetable coords which are: "+ JSON.stringify(targetable));
        return null;
      }
      //Create path and move
      var path = Game.Movement[mvtType].walk.getPath(this, coord[0], coord[1], coord[2]);
      if (path) {
        onStart();
        path.pop(); //the last coord is the actual position
        console.log("Follow path: "+JSON.stringify(path));
        var that = this;
        var cbk = function() {
          if (path.length === 0) {
            onFinish();
          }
          if (path.length !== 0) {
            Game.Movement[mvtType].walk.go(that, path.pop(), cbk);
          }
        };
        Game.Movement[mvtType].walk.go(this, path.pop(), cbk);
        return true;
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
  click: function(coord) {
    console.info("Clicked on terrain: "+JSON.stringify(coord));
    //check what is clicked on to know what do do:move, talk, action,...
    var voxCoord = Game.Graphics.getVoxPosFromAbsPos([1, 1, 1], coord[0], coord[1], coord[2]);
    var uids = this.c.associatedZone.c.container.get(voxCoord[0], voxCoord[1], voxCoord[2]);
    if (!uids || uids.length === 0) {
      if (this.s.walk) {
        var em = this.em;
        var that = this;
        this.s.walk.execute(voxCoord, function() {
          em.send("startAction", that);
        },
        function() {
          em.send("endAction", that);
          // em.send("setGUIState", that, "walk");
        });
      }
    } else {
      // for (var i=0, l=uids.length; i<l; i++) {
      //   var ent = this.c.associatedZone.c.entitiesList[uids[i]];
      //   if (ent.type === "living") {
      //     //TODO go next to it
      //     if (this.s.talk) {
      //       this.s.talk.execute(this.s.talk.getTargetable(), ent);
      //     }
      //   }
      // }
    }
  }
};

ECS.Systems.aiControled = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  think: function() {
    console.log(this.name+" is thinking...");
    var result = this.s.aiControled.moveRandomly();
    if (!result) {
      this.em.send("endTurn");
      this.em.send("startTurn");
    }
  },
  moveRandomly: function() {
    var em = this.em;
    var that = this;
    var targetable = this.s.walk.getTargetable();
    var index = Math.floor(Math.random()*targetable.length);
    return this.s.walk.execute(targetable[index], function() {
      em.send("startAction", that);
    }, function() {
      em.send("endAction", that);
      em.send("endTurn");
      em.send("startTurn");
    });
  },
  clean: function() {
  }
};

