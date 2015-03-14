var ECS = ECS || {};
ECS.Components = ECS.Components || {};

///////////////////////
// For generic entities
///////////////////////
ECS.Components.size = function() {
  return [1, 1, 1];
};

ECS.Components.appearance = function() {
  return {
    scene: null,
    meshName: null,
    mesh: null,
    oppacity: 1
  };
};

ECS.Components.consistence = function() {
  return 0;
};

ECS.Components.weight = function() {
  return 0;
};

ECS.Components.canBeAt = function() {
  return []; //List of entities name (water, earth,...)
};

ECS.Components.position = function() {
  return {
    abs: [0, 0, 0], //this should be the center point of the mesh
    vox: [0, 0, 0]  //this should be voxel at the bottom left of the mesh
  };
};

ECS.Components.movement = function() {
  return {
    isMoving: false,
    maxPoints: 1,
    currentPoints: 1,
    infiniteMvt: true //don't care about movement points
  };
};

ECS.Components.associatedZone = function() {
  return null;
};

//{type: "say|ask", content: "", choices={}}
ECS.Components.conversation = function() {
  return [];
};



///////////////////////
// For zone entities
///////////////////////
ECS.Components.container = function() {
  return null;
};

ECS.Components.entitiesList = function() {
  return {};
};

ECS.Components.defaultZoneGUI = function() {
  return {
    state: "move",
    domName: "defaultZoneGUI",
    pointedCoordAbs: null,
    pointedCoordVox: null,
    conversation: null,
    pointerIndicatorMesh: null
  };
};

ECS.Components.combatZoneGUI = function() {
  return {
    state: "move",
    domName: "combatZoneGUI",
    pointedCoordAbs: null,
    pointedCoordVox: null,
    // conversation: null,
    pointerIndicatorMesh: null,
    highlightMesh: null,
    uiControled: false
  };
};

ECS.Components.worldZoneGUI = function() {
  return {
    domName: "worldZoneGUI",
    pointedCoordAbs: null,
    pointedCoordVox: null,
    pointerIndicatorMesh: null,
    // highlightMesh: null,
  };
};

ECS.Components.combatZoneRules = function() {
  return {
    turnQueue: [],
    teams: {}
  };
};

ECS.Components.physicsRules = function() {
  return {
    move: "tile",
    gravity: 100
  };
};
