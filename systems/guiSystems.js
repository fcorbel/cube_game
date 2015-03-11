var ECS = ECS || {};
ECS.Systems = ECS.Systems || {};

ECS.Systems.defaultZoneGUI = {
  dependency: ["defaultZoneGUI"],
  callbacks: {"pointedCoordChanged": "updatePointerCoord",
              "mouseClicked": "click"},
  entityCallbacks: {},
  init: function() {
    var domEl = document.getElementById(this.c.defaultZoneGUI.domName);
    domEl.style.display = "initial";
    var convEl = document.getElementById("conversation");
    convEl.style.display = "none";
  },
  updatePointerCoord: function(old, now) {
    var elAbs = document.getElementById("pointerCoordAbs");
    var elVox = document.getElementById("pointerCoordVox");
    if (now) {
      var nowVox = Game.Graphics.getVoxPosFromAbsPos([1,1,1], now[0], now[1], now[2]);
      elAbs.innerHTML = now;
      elVox.innerHTML = nowVox;
      this.c.defaultZoneGUI.pointedCoordAbs = now;
      if (!this.c.defaultZoneGUI.pointedCoordVox || !Utils.arrayShallowEqual(this.c.defaultZoneGUI.pointedCoordVox, nowVox)){
        this.s.defaultZoneGUI.movePointerIndicator(nowVox[0], nowVox[1], nowVox[2]);
        this.c.defaultZoneGUI.pointedCoordVox = nowVox;
      }
    } else{
      elAbs.innerHTML = "";
      elVox.innerHTML = "";
      this.c.defaultZoneGUI.pointedCoordAbs = null;
      this.c.defaultZoneGUI.pointedCoordVox = null;
    }
  },
  movePointerIndicator: function(x, y, z) {
    var mesh = this.c.defaultZoneGUI.pointerIndicatorMesh;
    if (!mesh) {
      mesh = Game.Graphics.meshFactory.get("pointerIndicator");
      this.c.defaultZoneGUI.pointerIndicatorMesh = mesh;
      this.c.appearance.scene.add(mesh);
    }
    var absPos = Game.Graphics.getAbsPosFromVoxPos([1,1,1], x, y, z);
    mesh.position.x = absPos[0];
    mesh.position.y = absPos[1];
    mesh.position.z = absPos[2];
  },
  click: function(down, event) {
    if (down) {
      switch (this.c.defaultZoneGUI.state) {
        case "move":
          var coord = this.c.defaultZoneGUI.pointedCoordAbs;
          if (coord) {
            this.em.send("clickOnTerrain", coord);
          }
          break;
        default:
          break;
      }
    }
  },

  clean: function() {
    var domEl = document.getElementById(this.c.defaultZoneGUI.domName);
    domEl.style.display = "hidden";
  }

};

ECS.Systems.combatZoneGUI = {
  dependency: ["combatZoneGUI"],
  callbacks: {"pointedCoordChanged": "updatePointerCoord",
              "mouseClicked": "click",
              "startTurn": "startTurn",
              "updateLogic": "updateTurnEntInfos"},
  entityCallbacks: {},
  init: function() {
    var globEl = document.getElementById("globalGUI");
    globEl.style.display = "initial";
    var domEl = document.getElementById(this.c.combatZoneGUI.domName);
    domEl.style.display = "initial";
    this.s.combatZoneGUI.setTurnQueue();
  },
  startTurn: function() {
    this.s.combatZoneGUI.updateTurnQueueEl();
    this.s.combatZoneGUI.setState("walk");
    var turnEntUID = this.c.combatZoneGUI.turnQueue[0];
    var turnEnt = this.c.entitiesList[turnEntUID];
    if (this.c.combatZoneGUI.teams[turnEntUID] === "Player") {
      ECS.Entities.addSystem(turnEnt, "uiControled");
      turnEnt.initSystem("uiControled");
    } else {
      ECS.Entities.addSystem(this.c.entitiesList[turnEnt], "aiControled");
      turnEnt.initSystem("aiControled");
    }
  },
  endTurn: function() {
  },
  setState: function(newState) {
    var turnEnt = this.c.entitiesList[this.c.combatZoneGUI.turnQueue[0]];
    //clean previous state
    //set new state
    var sys = turnEnt.s[newState];
    if (!sys) {
      console.warn("No system available to set new state.");
      return null;
    }
    if (sys.getTargetable) {
      var targetable = sys.getTargetable();
      var mesh = Game.Graphics.getHighlightTilesMesh(targetable, "defaultHighlight");
      this.c.appearance.scene.add(mesh);
    }
    this.c.combatZoneGUI.state = newState;
  },
  setTurnQueue: function() {
    var teams = this.c.combatZoneGUI.teams;
    var turnQueue = this.c.combatZoneGUI.turnQueue;
    for (var entUID in teams) {
      turnQueue.push(entUID);
    }
  },
  updateTurnQueueEl: function() {
    var domEl = document.getElementById("turnQueueOl");
    var queue = this.c.combatZoneGUI.turnQueue;
    for (var i=0, l=queue.length; i<l; i++) {
      var ent = this.c.entitiesList[queue[i]];
      if (ent) {
        var liEl = document.createElement("li");
        liEl.innerHTML = ent.name;
        domEl.appendChild(liEl);
      }
    }
  },
  updateTurnEntInfos: function() {
    var elAbs = document.getElementById("turnEntCoordAbs");
    var elmeshAbs = document.getElementById("turnEntMeshCoordAbs");
    var elVox = document.getElementById("turnEntCoordVox");
    var ent = this.c.entitiesList[this.c.combatZoneGUI.turnQueue[0]];
    elAbs.innerHTML = ent.c.position.abs;
    elmeshAbs.innerHTML = JSON.stringify(ent.c.appearance.mesh.position);
    elVox.innerHTML = ent.c.position.vox;
  },
  updatePointerCoord: function(old, now) {
    var elAbs = document.getElementById("pointerCoordAbs");
    var elVox = document.getElementById("pointerCoordVox");
    if (now) {
      var nowVox = Game.Graphics.getVoxPosFromAbsPos([1,1,1], now[0], now[1], now[2]);
      elAbs.innerHTML = now;
      elVox.innerHTML = nowVox;
      this.c.combatZoneGUI.pointedCoordAbs = now;
      if (!this.c.combatZoneGUI.pointedCoordVox || !Utils.arrayShallowEqual(this.c.combatZoneGUI.pointedCoordVox, nowVox)){
        this.s.combatZoneGUI.movePointerIndicator(nowVox[0], nowVox[1], nowVox[2]);
        this.c.combatZoneGUI.pointedCoordVox = nowVox;
      }
    } else{
      elAbs.innerHTML = "";
      elVox.innerHTML = "";
      this.c.combatZoneGUI.pointedCoordAbs = null;
      this.c.combatZoneGUI.pointedCoordVox = null;
    }
  },
  movePointerIndicator: function(x, y, z) {
    var mesh = this.c.combatZoneGUI.pointerIndicatorMesh;
    if (!mesh) {
      mesh = Game.Graphics.meshFactory.get("pointerIndicator");
      this.c.combatZoneGUI.pointerIndicatorMesh = mesh;
      this.c.appearance.scene.add(mesh);
    }
    var absPos = Game.Graphics.getAbsPosFromVoxPos([1,1,1], x, y, z);
    mesh.position.x = absPos[0];
    mesh.position.y = absPos[1];
    mesh.position.z = absPos[2];
  },
  click: function(down, event) {
    if (down) {
      switch (this.c.combatZoneGUI.state) {
        case "walk":
          var coord = this.c.combatZoneGUI.pointedCoordAbs;
          if (coord) {
            this.em.send("clickOnTerrain", coord);
          }
          break;
        default:
          break;
      }
    }
  },

  clean: function() {
    var globEl = document.getElementById("globalGUI");
    globEl.style.display = "hidden";
    var domEl = document.getElementById(this.c.combatZoneGUI.domName);
    domEl.style.display = "hidden";
  }

};
