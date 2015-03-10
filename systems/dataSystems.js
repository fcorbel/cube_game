////////////////////
// Systems
////////////////////
var ECS = ECS || {};
ECS.Systems = ECS.Systems || {};
// ECS.Systems.move = {
//   dependency: [],
//   callbacks: {},
//   entityCallbacks: {},
//   init: function() {
// 
//   },
//   clean: function() {
// 
//   }
// };
// 

ECS.Systems.dataLoader = {
  //Load elements in the map
  //Manage entities like player, ennemies,...
  dependency: ["container", "entitiesList"],
  callbacks: {},
  entityCallbacks: {},

  init: function() {
    var entList = this.c.entitiesList;
    for (var uid in entList) {
      this.s.physicsRules.resolveGravity(entList[uid]);
      entList[uid].initSystems();
    }
  },

  addTerrainEnt: function(elName, x, y, z) {
    var ent = Factories.fac.create(elName, this.em);
    ent.c.appearance.scene = this.c.appearance.scene;
    return this.s.dataLoader.addEntity(ent, x, y, z);
  },

  addEntity: function(ent, x, y, z) {
    var data = this.c.container;
    if (x<0 || y<0 || z<0 || x>=data.sizeX || y>=data.sizeY || z>=data.sizeZ) {
      return null;
    }
    ent.c.associatedZone = this;
    ent.c.position.vox = [x, y, z];
    ent.c.position.abs = Game.Graphics.getAbsPosFromVoxPos(ent.c.size, x, y, z);
    ent.initSystem("storedInZoneContainer");

    return ent;

  },

  getMapContent: function(x, y, z) {
    var data = this.c.associatedContainer;
    if (x<0 || y<0 || z<0 || x>=data.sizeX || y>=data.sizeY || z>=data.sizeZ) {
      return null;
    }
    return data.get(x, y, z);
  },

  eachEnt: function(x, y, z, cbk) {
    var uids = this.s.dataLoader.getMapContent(x, y, z);
    for (var i=0, l=uids.length; i<l; i++) {
      var ent = this.c.entitiesList[uids[i]];
      cbk(ent);
    }
  },

  serialize: function() {
    var data = this.c.container;
    var zoneInfos = {};
    zoneInfos.sizeX = data.sizeX;
    zoneInfos.sizeY = data.sizeY;
    zoneInfos.sizeZ = data.sizeZ;
    zoneInfos.terrain = [];
    zoneInfos.living = [];
    var serializedEls = {};
    data.forEach(function(uids, x, y, z) {
      for (var i=0; i<uids.length; i++) {
        var uid = uids[i];
        if (uid) {
          if (serializedEls[uid] === undefined) {
            var ent = this.c.entitiesList[uid];
            var data = JSON.parse(ECS.Entities.serialize(ent));
            switch(ent.type) {
              case "terrain":
                zoneInfos.terrain.push(data);
                break;
              case "living":
                zoneInfos.living.push(data);
                break;
              default:
                break;
            }
            serializedEls[uid] = true;
          }
        }
      }
    }, this);
    return JSON.stringify(zoneInfos);
  },

  loadFromJson: function(json) {
    console.debug("Loading from json data");
    var zoneInfos = JSON.parse(json);
    var data = Tools.Containers.create3dContainer(zoneInfos.sizeX, zoneInfos.sizeY, zoneInfos.sizeZ, []);
    this.c.container = data;
    var terr = zoneInfos.terrain;
    for (var i=0; i<terr.length; i++) {
      var ent = Factories.fac.create(terr[i], this.em);
      ent.c.appearance.scene = this.c.appearance.scene;
      ent.c.associatedZone = this;
      ent.initSystem("storedInZoneContainer");
    }
  },
  
  loadPlane: function(x, z) {
    var data = Tools.Containers.create3dContainer(x, 10, z, []);
    this.c.container = data;
    var scene = this.c.appearance.scene;
    for (var i=0; i<data.sizeX; i++){
      for (var j=0; j<data.sizeZ; j++) {
        this.s.dataLoader.addTerrainEnt("earth", i, 0, j);
        this.s.dataLoader.addTerrainEnt("grass", i, 1, j);
      }
    }
  },

  loadStairs: function() {
    var data = Tools.Containers.create3dContainer(10, 20, 6, []);
    this.c.container = data;
    var scene = this.c.appearance.scene;
    for (var j=0; j<data.sizeY; j++) {
      for (var i=j; i<data.sizeX; i++){
        for (var k=0; k<data.sizeZ-j; k++) {
          this.s.dataLoader.addTerrainEnt("grass", i, j, k);
        }
      }
    }
  },

  clean: function() {
    var data = this.get("associatedContainer", "value");
    data.forEach(function(uid, x, y, z) {
      if (uid) {
        Game.e.destroyEntity(Game.e.entities[uid], this.em);
      }
    }, this);
    this.set("associatedContainer", "value", null);
    this.set("entitiesList", "value", null);
  }
};


ECS.Systems.storedInZoneContainer = {
  dependency: ["associatedZone", "position", "size"],
  callbacks: {},
  entityCallbacks: {"moved": "updatePosition"},
  init: function() {
    var cont = this.c.associatedZone.c.container;
    if (!cont) {
      console.error("No container in zone, can't store anywhere.");
    } else {
      var pos = this.c.position;
      this.s.storedInZoneContainer.storeInContainer(cont, pos.vox[0], pos.vox[1], pos.vox[2]);
      this.c.associatedZone.c.entitiesList[this.uid] = this;
    }
  },
  storeInContainer: function(cont, x, y, z) {
    // console.group("Store in container");
    // console.debug("Store "+this.name+" at: "+x+","+y+","+z);
    var size = this.c.size;
    for (var i=0; i<size[0]; i++) {
      for (var j=0; j<size[1]; j++) {
        for (var k=0; k<size[2]; k++) {
          var content = cont.get(x+i, y+j, z+k);
          content.push(this.uid);
          cont.set(x+i, y+j, z+k, content);
        }
      }
    }
    // console.groupEnd();
  },
  removeFromContainer: function(cont, x, y, z) {
    // console.group();
    var size = this.c.size;
    for (var i=0; i<size[0]; i++) {
      for (var j=0; j<size[1]; j++) {
        for (var k=0; k<size[2]; k++) {
          // console.log("remove from: "+(x+i)+","+(y+j)+","+(z+k));
          var content = cont.get(x+i, y+j, z+k);
          var index = content.indexOf(this.uid);
          if (index > -1){
            content.splice(index, 1);
          } else {
            console.warn("Try to remove element but not there.");
          }
          cont.set(x+i, y+j, z+k, content);
        }
      }
    }
    // console.groupEnd();
  },
  updatePosition: function(fromPos, toPos) {
    var cont = this.c.associatedZone.c.container;
    this.s.storedInZoneContainer.removeFromContainer(cont, fromPos[0], fromPos[1], fromPos[2]);
    this.s.storedInZoneContainer.storeInContainer(cont, toPos[0], toPos[1], toPos[2]);
  },
  isAt: function(x, y, z) {
    var pos = this.c.position.vox;
    var size = this.c.size;
    if (x>=pos[0] && x<pos[0]+size[0] && y>=pos[1] && y<pos[1]+size[1] && z>=pos[2] && z<pos[2]+size[2]) {
      return true;
    } else {
      return false;
    }
  },
  clean: function() {
    var pos = this.c.position.vox;
    var cont = this.c.associatedZone.c.container;
    this.s.storedInZone.removeFrom(cont, pos[0], pos[1], pos[2]);
    delete this.c.associatedZone.c.entitiesList[this.uid];
  }
};
