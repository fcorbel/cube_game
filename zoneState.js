if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createZone = function() {
  var state = createEmptyState();
  state.name = "zone";
  state.zone = null;
  state.em = new Utils.EventManager(false);
  
  state.enter = function() {
    console.log("ENTER ZONE STATE");
  };

  state.exit = function() {

  };

  state.keyDown = function(event) {
    //Send an event for those interested
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
  state.zone = Factories.fac.create("defaultZone", state.em);
  state.zone.c.appearance.scene = sceneInfos.scene;

  // state.zone.s.dataLoader.loadStairs();
  state.zone.s.dataLoader.loadPlane(5, 5);

  // Entities
  var player = Factories.fac.create("averageGuy", state.em);
  player.name = "player";
  player.c.appearance.scene = sceneInfos.scene;
  player.c.appearance.meshName = "specialGuy";
  ECS.Entities.addSystem(player, "uiControled");
  state.zone.s.dataLoader.addEntity(player, 0, 6, 0);
  
  var mouse = Factories.fac.create("mouse", state.em);
  mouse.c.appearance.scene = sceneInfos.scene;
  ECS.Entities.addSystem(mouse, "aiControled");
  state.zone.s.dataLoader.addEntity(mouse, 4, 6, 4);

  state.zone.initSystems();

  var plPos = player.c.appearance.mesh.position;
  // camera.focusPoint = [plPos.x, plPos.y, plPos.z];
  camera.focusPoint = player.c.position.abs;

  // var data = state.zone.s.dataLoader.serialize();
  // var url = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
  // window.open(url, '_blank');

  var domEl = document.getElementById("screen");
  domEl.appendChild(sceneInfos.renderer.domElement);

  return state;
};
