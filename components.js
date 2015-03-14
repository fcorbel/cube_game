var ECS = ECS || {};
ECS.Components = ECS.Components || {};

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
    infiniteMvt: true
  };
};

ECS.Components.container = function() {
  return null;
};

ECS.Components.entitiesList = function() {
  return {};
};

ECS.Components.associatedZone = function() {
  return null;
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

//{type: "say|ask", content: "", choices={}}
ECS.Components.conversation = function() {
  return [];
};

ECS.Components.floating = function() {
  return true;
};
