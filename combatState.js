if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createCombat = function() {
  var state = createEmptyState();
  state.name = "Combat";
  state.zone = null;
  state.em = new Utils.EventManager(false);
  
  state.enter = function() {
    console.log("ENTER COMBAT ZONE STATE");
  };

  state.exit = function() {
    console.log("LEAVE COMBAT ZONE STATE");
  };

  state.keyDown = function(event) {
    state.em.send("kd"+event.keyCode, event);
  };

  state.keyUp = function(event) {
    state.em.send("ku"+event.keyCode, event);
  };

  state.mouseClicked = function(down, event) {
    state.em.send("mouseClicked", down, event);
  };

  state.mouseWheel = function(event) {
    state.em.send("mouseWheel", event);
  };

  state.mouseMoved = function(event) {
    state.em.send("mouseMoved", event);
  };

  state.update = function(delta) {
    this.em.send("updateLogic", delta);
    this.em.process();
    camera.update(delta);
    TWEEN.update();
  };

  state.draw = function(delta) {
    sceneInfos.render(camera.threejsCam);
  };

  //////////////////
  // Initialization
  //////////////////
  var sceneInfos = Game.Graphics.createScene();
  var camera = Game.Graphics.createCamera(state.em);
  var pointer = Game.createPointer(state.em, camera.threejsCam);
  //Zone
  state.zone = Factories.fac.create("combatZone", state.em);
  state.zone.c.appearance.scene = sceneInfos.scene;

  state.zone.s.dataLoader.loadPlane(5, 5);

  // Entities
  var player = Factories.fac.create("averageGuy", state.em);
  player.name = "player";
  player.c.appearance.scene = sceneInfos.scene;
  player.c.appearance.meshName = "specialGuy";
  player.c.movement.infiniteMvt = false;
  state.zone.s.dataLoader.addEntity(player, 0, 6, 0);
  
  var mouse = Factories.fac.create("mouse", state.em);
  mouse.c.appearance.scene = sceneInfos.scene;
  ECS.Entities.addSystem(mouse, "aiControled");
  state.zone.s.dataLoader.addEntity(mouse, 4, 6, 4);

  //////////////////
  // Specific to combat state
  //////////////////
  state.zone.c.combatZoneRules.teams[player.uid] = "Player";
  state.zone.c.combatZoneRules.teams[mouse.uid] = "Ennemy";

  state.zone.initSystems();
  var plPos = player.c.appearance.mesh.position;
  camera.focusPoint = player.c.position.abs;
  state.em.send("startTurn");

  var domEl = document.getElementById("screen");
  domEl.appendChild(sceneInfos.renderer.domElement);

  return state;
};

