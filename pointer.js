if (!Game) {
  var Game = {};
}


Game.createPointer = function(em_, cam) {
  var p = {};
  var em = em_;
  var camera = cam;
  
  p.pointedCoord = null;

  p.getCoordFromMouse = function(event, mesh) {
    if (!mesh) {
      console.warn("No mesh to raycast.");
      return;
    }
    //get mouse position relative to game window
    var domEl = document.getElementById("screen");
    var x = event.pageX - domEl.offsetLeft;
    var y = event.pageY - domEl.offsetTop;
    //get these coords as -1 +1 range
    var mouseX = (x / window.innerWidth) * 2 - 1;
    var mouseY = -(y / window.innerHeight) * 2 + 1;
    var mouse2D = new THREE.Vector3(mouseX, mouseY, 1);
    var projector = new THREE.Projector();
    var raycaster = new THREE.Raycaster();
    // Convert the [-1, 1] screen coordinate into a world coordinate on the near plane
    projector.unprojectVector(mouse2D, camera);
    raycaster.set(camera.position, mouse2D.sub(camera.position).normalize());
    // See if the ray from the camera into the world hits one of our meshes
    if (mesh instanceof Array) {
      intersects = raycaster.intersectObjects(mesh);
    } else {
      intersects = raycaster.intersectObject(mesh);
    }
    if (intersects.length > 0) {
      var xAbs, yAbs, zAbs;
      xAbs = Math.round(intersects[0].point.x);
      yAbs = Math.round(intersects[0].point.y);
      zAbs = Math.round(intersects[0].point.z);
      return [xAbs, yAbs, zAbs];
    }
    // console.debug("Pointer on nothing...");
    return null;
  };
  
  p.move = function(event) {
    em_.send("TOTO");
    if (!event.target.classList.contains("background")) { //Don't do anyrhing if mouse on gui
      return;
    }
    var coord = p.getCoordFromMouse(event, Game.Graphics.selectableMeshs);
    em.send("pointedCoordChanged", p.pointedCoord, coord);    
    p.pointedCoord = coord;
  };

  em.register("mouseMoved", p.move);
  return p;
};
