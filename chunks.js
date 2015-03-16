var Game = Game || {};
Game.Chunks = Game.Chunks || {};

Game.Chunks.addEntity = function(ent, x, y, z, cont) {
};

Game.Chunks.create = {
  loadOcean: function(x, y, z) {
    var data = Tools.Containers.create3dContainer(x, y, z, []);
    // this.c.container = data;
    // var scene = this.c.appearance.scene;
    for (var i=0; i<data.sizeX; i++){
      for (var j=0; j<data.sizeZ; j++) {
        this.s.dataLoader.addTerrainEnt("water", i, 0, j);
      }
    }
  },
  


};
