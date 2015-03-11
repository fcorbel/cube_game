if (!Game) {
  var Game = {};
}

if (!Game.GUI) {
  Game.GUI = {};
}

Game.GUI.createDefaultZoneGUI = function(em, camera, zone) {
  var gui = {};

  gui.em = em;
  gui.pointer = Game.createPointer(em, camera);
  // gui.zone = zone;
  gui.mode = null;

  gui.domEl = document.getElementById("zoneGUI");
  gui.domEl.style.display = "initial";

  gui.updateHovered = function(oldCoord, newCoord) {
    var name = document.getElementById("entName");
    var type = document.getElementById("entType");
    var position = document.getElementById("entPos");
    var groundPosition = document.getElementById("groundPos");
    var groundType = document.getElementById("groundType");
    var ent, pos;
    if (oldCoord) {
      //unhover on old one
      gui.zone.s.dataLoader.eachEnt(oldCoord[0], oldCoord[1], oldCoord[2], function(e) {
        if (e.type !== "terrain") {
          //Do not send unHovered if ent is also in the newCoord
          if (!newCoord || !e.s.storedInZone.isAt(newCoord[0], newCoord[1], newCoord[2])) {
            e.send("unHovered");
          } else {
            console.log("Same ent");
          }
        }
      });
    }
    if (newCoord) {
      //hover new one
      gui.zone.s.dataLoader.eachEnt(newCoord[0], newCoord[1], newCoord[2], function(e) {
        if (e.type !== "terrain") {
          e.send("hovered");
          ent = e;
        }
      });
      if (ent) {
        name.innerHTML = ent.name;
        type.innerHTML = ent.type;
        pos = ent.get("position");
        position.innerHTML = pos.x+","+pos.y+","+pos.z;
      } else {
        //hover not on any living ent
        name.innerHTML = "None";
        type.innerHTM = "None";
        position.innerHTML = "_, _, _";
        pos = {x: newCoord[0], y: newCoord[1], z: newCoord[2]};
      }
      //show ground infos
      gui.zone.s.dataLoader.eachEnt(pos.x, pos.y-1, pos.z, function(e) {
        pos = e.get("position");
        groundPosition.innerHTML = pos.x+","+pos.y+","+pos.z;
        groundType.innerHTML = e.name;
      });
    } else {
      //hover on nothing (not on the map)
      name.innerHTML = "None";
      type.innerHTML = "None";
      position.innerHTML = "_, _, _";
      groundPosition.innerHTML = "_, _, _";
      groundType.innerHTML = "None";
    }
  };


  gui.setMode = function(mode) {
    gui.mode = mode;
    console.info("Gui mode set to: "+mode);
  };

  gui.mouseClick = function(down, event) {
    if (event.target.className !== "background") { //Don't do anyrhing if mouse on gui
      return;
    }
    if (down) {
      if (gui.targetableMesh) {
        var coord = gui.pointer.getVoxelCoordFromMouse(event, gui.targetableMesh);
        console.log("click on: "+coord); //TODO pb: coord too high check the positioning of the mesh (1px offset?)
        if (coord) {
          var sys = Game.e.entities[gui.selected].s[gui.mode];
          gui.hideActionsList();
          sys.execute(function() {
            gui.setMode("move", gui.selected);
            gui.showActionsList(gui.selected);
          }, gui.targetable, coord);
        } else {
          console.info("Click not on any targetable");
          console.log(coord);
        }
      }
    }
  };

  em.register("pointedCoordChanged", gui.updateHovered);
  em.register("mouseClicked", gui.mouseClick);
  em.register("setGUIMode", function(mode, uid) {
    gui.setMode(mode, uid);
  });
  // em.register("showActionsList", gui.showActionsList);
  return gui;
};
