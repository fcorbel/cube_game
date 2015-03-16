var ECS = ECS || {};
ECS.Entities = ECS.Entities || {};

ECS.Entities.Tpl = {};

ECS.Entities.Tpl.defaultZone = {
  type: "zone",
  name: "defaultZone",
  comp: {
    container: true,
    entitiesList: true,
    appearance:true,
    defaultZoneGUI: true,
    physicsRules: true
  },
  sys: ["dataLoader", "drawZone", "sunLighting", "physicsRules", "defaultZoneGUI"]
};

ECS.Entities.Tpl.worldZone = {
  type: "zone",
  name: "worldZone",
  comp: {
    container: true,
    chunksManager: true,
    entitiesList: true,
    appearance:true,
    worldZoneGUI: true,
    physicsRules: true
  },
  sys: ["dataLoader", "chunksManager", "drawZone", "sunLighting", "physicsRules", "worldZoneGUI"]
};

ECS.Entities.Tpl.combatZone = {
  type: "zone",
  name: "combatZone",
  comp: {
    container: true,
    entitiesList: true,
    appearance:true,
    combatZoneGUI: true,
    combatZoneRules: true,
    physicsRules: true
  },
  sys: ["dataLoader", "drawZone", "sunLighting", "physicsRules", "combatZoneGUI", "combatZoneRules"]
};

ECS.Entities.Tpl.water = {
  type: "terrain",
  name: "water",
  comp: {
    appearance: {
      meshName: "waterTerrain",
      oppacity: 0.5
    },
    consistence: 0.2,
    weight: 100,
    size: true,
    position: true,
    associatedZone: true
  },
  sys: ["storedInZoneContainer"]
};

ECS.Entities.Tpl.earth = {
  type: "terrain",
  name: "earth",
  comp: {
    appearance: {
      meshName: "earthTerrain",
    },
    consistence: 1,
    weight: 100,
    size: true,
    position: true,
    associatedZone: true
  },
  sys: ["storedInZoneContainer"]
};

ECS.Entities.Tpl.grass = {
  type: "terrain",
  name: "grass",
  comp: {
    appearance: {
      meshName: "grassTerrain",
    },
    consistence: 1,
    weight: 100,
    size: true,
    position: true,
    associatedZone: true
  },
  sys: ["storedInZoneContainer"]
};

ECS.Entities.Tpl.averageGuy = {
  type: "living",
  name: "averageGuy",
  comp: {
    appearance: {
      meshName: "averageGuy",
    },
    consistence: 1,
    weight: 60,
    size: [1, 4, 1],
    position: true,
    associatedZone: true,
    movement: {
      maxPoints: 2,
      currentPoints: 2
    }
  },
  sys: ["storedInZoneContainer", "drawEntity", "walk", "talk", "dance"]
};

ECS.Entities.Tpl.mouse = {
  type: "living",
  name: "mouse",
  comp: {
    appearance: {
      meshName: "mouse",
    },
    consistence: 1,
    weight: 4,
    size: [1, 1, 1],
    position: true,
    associatedZone: true,
    movement: true
  },
  sys: ["storedInZoneContainer", "drawEntity", "walk"]
};

ECS.Entities.Tpl.defaultBoat = {
  type: "living",
  name: "defaultBoat",
  comp: {
    appearance: {
      meshName: "mouse",
    },
    consistence: 1,
    weight: 4,
    size: [1, 1, 1],
    position: true,
    associatedZone: true,
    movement: true,
    floating: true
  },
  sys: ["storedInZoneContainer", "drawEntity", "move"]
};
