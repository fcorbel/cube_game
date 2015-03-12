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
  dependency: ["combatZoneGUI", "combatZoneRules"],
  callbacks: {"pointedCoordChanged": "updatePointerCoord",
              "mouseClicked": "click",
              "turnStarted": "updateGUIStart",
              // "turnEnded": "updateGUIEnd",
              "startAction": "enterInActionState",
              "endAction": "leaveInActionState",
              "setGUIState": "setState",
              "updateLogic": "updateTurnEntInfos"},
  entityCallbacks: {},
  init: function() {
    var globEl = document.getElementById("globalGUI");
    globEl.style.display = "initial";
    var domEl = document.getElementById(this.c.combatZoneGUI.domName);
    domEl.style.display = "initial";
    
    var em = this.em;
    document.getElementById("endTurn").onclick = function() {
      em.send("endTurn");
      em.send("startTurn");
    };
  },
  updateGUIStart: function(ent) {
    this.s.combatZoneGUI.updateTurnQueueEl();
    this.s.combatZoneGUI.setState(ent, "walk");
    if (ent.s.uiControled) {
      this.c.combatZoneGUI.uiControled = true;
    } else {
      this.c.combatZoneGUI.uiControled = false;
    }
  },
  //TODO create a state "acting" to represent the fact tha its doing something
  setState: function(ent, newState) {
    //clean previous state
    if (this.c.combatZoneGUI.highlightMesh) {
      this.c.appearance.scene.remove(this.c.combatZoneGUI.highlightMesh);
      this.c.combatZoneGUI.highlightMesh = null;
    }
    //set new state
    if (newState !== "inAction") {
      var sys = ent.s[newState];
      if (!sys) {
        console.warn("No system available to set new state.");
        return null;
      }
      if (sys.getTargetable) {
        var highlightName = "defaultHighlight";
        if (newState === "walk") {
          highlightName = "moveHighlight";
        }
        var targetable = sys.getTargetable();
        var mesh = Game.Graphics.getHighlightTilesMesh(targetable, highlightName);
        this.c.appearance.scene.add(mesh);
        this.c.combatZoneGUI.highlightMesh = mesh;
      }
    }
    this.c.combatZoneGUI.state = newState;
    console.debug("GUI state set to: "+newState+", for entity: "+ent.name);
  },
  enterInActionState: function(ent) {
    if (ent.uid !== this.c.combatZoneRules.turnQueue[0]) {
      console.error("An entity tried to do an action while it's not it's turn.");
      return null;
    }
    this.s.combatZoneGUI.setState(ent, "inAction");
  },
  leaveInActionState: function(ent) {
    if (ent.uid !== this.c.combatZoneRules.turnQueue[0]) {
      console.error("An entity tried to leave an action while it's not it's turn.");
      return null;
    }
    this.s.combatZoneGUI.setState(ent, "walk");
  },
  updateTurnQueueEl: function() {
    var domEl = document.getElementById("turnQueueOl");
    domEl.innerHTML = "";
    var queue = this.c.combatZoneRules.turnQueue;
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
    var currMovePt = document.getElementById("currentMovePoints");
    var maxMovePt = document.getElementById("maxMovePoints");
    var ent = this.c.entitiesList[this.c.combatZoneRules.turnQueue[0]];
    elAbs.innerHTML = ent.c.position.abs;
    elmeshAbs.innerHTML = JSON.stringify(ent.c.appearance.mesh.position);
    elVox.innerHTML = ent.c.position.vox;
    currMovePt.innerHTML = ent.c.movement.currentPoints;
    maxMovePt.innerHTML = ent.c.movement.maxPoints;
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
    if (this.c.combatZoneGUI.uiControled) {
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
    }
  },

  clean: function() {
    var globEl = document.getElementById("globalGUI");
    globEl.style.display = "hidden";
    var domEl = document.getElementById(this.c.combatZoneGUI.domName);
    domEl.style.display = "hidden";
  }

};
