var ECS = ECS || {};
ECS.Systems = ECS.Systems || {};
// ECS.Systems.dance = {
//   dependency: [],
//   callbacks: {},
//   entityCallbacks: {},
//   init: function() {
//   },
//   clean: function() {
//   }
// };


ECS.Systems.talk = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  execute: function(targetable, targetEnt) {
    for (var i=0, l=targetable.length; i<l; i++) {
      if (targetable[i][0] === targetEnt.c.position.vox[0] && targetable[i][2] === targetEnt.c.position.vox[2]) { //Do not care for Y position. Should we?
        var conv = targetEnt.c.conversation;
        if (conv) {
          stateManager.pushState(Game.States.createConversation(this, targetEnt, conv));
        } else {
          stateManager.pushState(Game.States.createConversation(this, null, [{type: "say", content: "It doesn't answer"}]));
        }
        return true;
      }
    }
    console.log("Cannot talk to target: too far");
    return false;
  },
  getTargetable: function() {
    var pos = this.c.position.vox;
    return [[pos[0]-1, pos[1], pos[2]], [pos[0]+1, pos[1], pos[2]], [pos[0], pos[1], pos[2]-1], [pos[0], pos[1], pos[2]+1]];
  },
  isTargetable: function(x, y, z) {
  },
  clean: function() {
  }
};

ECS.Systems.dance = {
  type: "action",
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  execute: function(cbk) {
    console.info(this.name+" is dancing");
    var mesh = this.get("appearance", "mesh");
    var xOri = mesh.position.x;
    var zOri = mesh.position.z;
    var pathX = [xOri-8, xOri, xOri+8, xOri, xOri];
    var pathZ = [zOri, zOri-8, zOri, zOri+8, zOri];
    new TWEEN.Tween({x: xOri, z: zOri})
      .to({x: pathX, z: pathZ}, 300)
      .onUpdate(function() {
            mesh.position.x = this.x;
            mesh.position.z = this.z;
          })
      .onComplete(cbk)
      .repeat(4)
      .start();
  },
  clean: function() {
  }
};

ECS.Systems.attack = {
  type: "action",
  dependency: ["stats"],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  execute: function(cbk, targetable, target) {
    console.log("ATTACK on: "+target);
    var map = this.get("associatedZone", "value").get("associatedContainer","value");
    var ents = map.getA(target);
    console.log("ATTACK on: "+ents);
    
    cbk();
  },
  getTargetable: function() {
    var zone = this.get("associatedZone", "value");
    var pos = this.get("position");
    var pattern = [[pos.x-1, pos.y, pos.z], [pos.x, pos.y, pos.z-1], [pos.x+1, pos.y, pos.z], [pos.x, pos.y, pos.z+1]];
    var targetable = [];
    for (var i=0; i<pattern.length; i++) {
      var res = Game.Movement.walk.canMoveFromTo(this, pos, pattern[i][0], pattern[i][2], zone, zone.get("associatedContainer", "value"));
      if (res !== null) {
        targetable.push(pattern[i][0]+"-"+(res-1)+"-"+pattern[i][2]);
      }
    }
    return targetable;
  },
  clean: function() {
  }
};
