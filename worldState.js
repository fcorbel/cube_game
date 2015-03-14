if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createWorld = function() {
  var state = createEmptyState();
  state.name = "World";
  state.zone = null;
  state.em = new Utils.EventManager(false);
  
  state.enter = function() {
    console.log("ENTER WORLD ZONE STATE");
  };

  state.exit = function() {
    console.log("LEAVE WORLD ZONE STATE");
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
  state.zone = Factories.fac.create("worldZone", state.em);
  state.zone.c.appearance.scene = sceneInfos.scene;
  state.zone.s.dataLoader.loadOcean(5, 2, 5);

  // Entities
  var player = Factories.fac.create("defaultBoat", state.em);
  player.c.appearance.scene = sceneInfos.scene;
  state.zone.s.dataLoader.addEntity(player, 0, 1, 0);
  ECS.Entities.addSystem(player, "uiControled");

  //////////////////
  // Specific to world state
  //////////////////
  state.zone.initSystems();


  var domEl = document.getElementById("screen");
  domEl.appendChild(sceneInfos.renderer.domElement);

  return state;
};


