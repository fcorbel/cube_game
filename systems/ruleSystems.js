var ECS = ECS || {};
ECS.Systems = ECS.Systems || {};

ECS.Systems.physicsRules = {
  dependency: ["container", "physicsRules"],
  callbacks: {/* "moved": "topMoveToo" */},
  entityCallbacks: {},
  canBeAt: function(uid, size, consistence, x, y, z) {
    // console.log("check:"+pos.x+","+pos.y+","+pos.z);
    var data = this.c.container;
    for (var i=0; i<size[0]; i++) {
      for (var j=0; j<size[1]; j++) {
        for (var k=0; k<size[2]; k++) {
          //check for impossible to be voxel (ex:solid, null...)
          var voxPos = [x+i, y+j, z+k];
          //out of the zone
          if (voxPos[0]<0 || voxPos[1]<0 || voxPos[2]<0 || voxPos[0]>=data.sizeX || voxPos[1]>=data.sizeY || voxPos[2]>=data.sizeZ) {
            // console.debug("Can't be there, out of zone: "+ voxPos);
            return false;
          }
          var targetsUID = data.get(voxPos[0], voxPos[1], voxPos[2]);
          for (var t=0; t<targetsUID.length; t++) {
            if (targetsUID[t] !== uid) { //Can still be where ent is itself
              var target = this.c.entitiesList[targetsUID[t]];
              //empty voxel
              if (consistence > 0) {
                if (target.c.consistence === 1) {
                  // console.debug("Can't go there: solid against solid: "+ voxPos + " = "+target.name);
                  return false;
                }
              }
            }
          }
        }
      }
    }
    return true;
  },
  resolveGravity: function(ent) {
    //make it fall down if nothing under it
    var currPos = ent.c.position.vox;
    var ground = currPos[1] - 1;
    // console.log("Resolve gravity for ent: "+ent.name+" first check y="+ground);
    while(Game.Movement.goToVox(ent, currPos[0], ground, currPos[2], null, null)) {
      ground -= 1;
    }
  },

  // topMoveToo: function(ent, from, to) {
  //   //move props/living if it's on top of it's head
  //   var map = this.get("associatedContainer", "value");
  //   var fx = from.x;
  //   var fy = from.y + ent.get("size", "value")[1];
  //   var fz = from.z;

  //   if (fy >= map.sizeY) {
  //     console.debug("Top is out of map");
  //     return false;
  //   }
  //   var topEnts = map.get(fx, fy, fz);
  //   if (topEnts.length > 0) {
  //     var toTop = {};
  //     toTop.x = to.x;
  //     toTop.y = to.y + ent.get("size", "value")[1];
  //     toTop.z = to.z;
  //     for (var i=0; i<topEnts.length; i++) {
  //       var topEnt = Game.e.entities[topEnts[i]];
  //       if (topEnt.type === "living") {
  //         if (this.s.physicsRules.canBeAt(topEnt, toTop)) {
  //           Game.Movement.goToNoCheck(topEnt, toTop); //TODO add speed/cbk
  //         } else {
  //           zone.s.physicsRules.resolveGravity(topEnt);
  //         }
  //       }
  //     }
  //   } else {
  //     return false;
  //   }
  // },
};
