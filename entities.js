var ECS = ECS || {};
ECS.Entities = ECS.Entities || {};

ECS.Entities.Entity = function(type, name, em) {
  Utils.EventManager.call(this, true);
  this.uid = Utils.getUID();
  this.type = type;
  this.name = name;
  this.em = em;
  this.c = {
    isDirty: {}  
  };
  this.s = {};
};
ECS.Entities.Entity.prototype = Object.create(Utils.EventManager.prototype);
ECS.Entities.Entity.prototype.constructor = ECS.Entities.Entity;

ECS.Entities.Entity.prototype.initSystems = function() {
  for (var sysName in this.s) {
    this.initSystem(sysName);
  }
};
ECS.Entities.Entity.prototype.cleanSystems = function() {
  for (var sysName in this.s) {
    this.cleanSystem(sysName);
  }
};
ECS.Entities.Entity.prototype.initSystem = function(sysName) {
  var sys = this.s[sysName];
  if (sys) {
    if (!sys.initialized) {
      // console.debug("Init system \"" + sysName + "\" for entity uid = " + this.uid);
      //Set callbacks (global & entity)
      var cbks = ECS.Systems[sysName].callbacks;
      if (Object.keys(cbks).length !== 0) {
        for (var evt in cbks) {
          if (!sys[cbks[evt]]) {
            console.warn("Register event to an undefined function.");
          }
          this.em.register(evt, sys[cbks[evt]]);
        }
      }
      var entCbks = ECS.Systems[sysName].entityCallbacks;
      if (Object.keys(entCbks).length !== 0) {
        for (var eEvt in entCbks) {
          this.register(eEvt, sys[entCbks[eEvt]]);
        }
      }
      //Call custom init if available
      if (sys.hasOwnProperty("init")) {
        sys.init();
      }
      sys.initialized = true;
    } else {
      console.warn("Trying to initialize a system (" + sysName + ") already initialized");
    }
  } else {
    console.warn("No system named: " + sysName + ", can't init.");
  }
};
ECS.Entities.Entity.prototype.cleanSystem = function(sysName) {
  var sys = this.s[sysName];
  if (sys) {
    if (sys.initialized) {
      // console.debug("Clean system \"" + sysName + "\" for entity uid = " + uid);
      //Clean callbacks
      var cbks = ECS.Systems[sysName].callbacks;
      if (cbks) {
        for (var evt in cbks) {
          this.em.unRegister(evt, sys[cbks[evt]]);
        }
      }
      var entCbks = ECS.Systems[sysName].entityCallbacks;
      if (entCbks) {
        for (var eEvt in entCbks) {
          this.unRegister(eEvt, sys[entCbks[eEvt]]);
        }
      }
      //Call custom clean if available
      if (sys.hasOwnProperty("clean")) {
        sys.clean();
      }
      sys.initialized = false;
    }
  } else {
    console.warn("No system named: " + sysName + ", can't clean.");
  }
};


ECS.Entities.addComponent = function(ent, compName, opt) {
  var comp = ECS.Components[compName];
  if (comp === undefined) {
    console.warn("No component named: "+compName);
    return;
  }
  // console.log("Add component named: "+compName);
  ent.c[compName] = comp();
  if (opt !== undefined) {
    if (typeof opt === "object") {
      ent.c[compName] = Utils.merge({}, ent.c[compName], opt);
    } else if (Array.isArray(opt)) {
      ent.c[compName] = opt.slice();
    } else {
      ent.c[compName] = opt;
    }
  }
  ent.c.isDirty[compName] = true;
};
ECS.Entities.removeComponent = function(ent, compName) {
  var comp = ent.c[compName];
  if (comp === undefined) {
    console.warn("No component named: "+compName);
    return;
  }
  console.log("Remove component named: "+compName);
  delete ent.c[compName];
};
ECS.Entities.hasComponent = function(ent, compName) {
  return ent.c[compName] !== undefined;
};
ECS.Entities.addSystem = function(ent, sysName) {
  var sys = ECS.Systems[sysName];
  if (sys) {
    // Check dependency
    var dep = sys.dependency;
    if (dep) {
      for (var i=0; i<dep.length; i++) {
        if (!ECS.Entities.hasComponent(ent, dep[i])) {
          console.warn("Dependency \"" + dep[i] + "\" not found for system: " + sysName);
          return;
        }
      }
    }
    // Add functions of system
    ent.s[sysName] = {};
    for (var p in sys) {
      if (typeof sys[p] === "function") {
        ent.s[sysName][p] = sys[p].bind(ent);
      }
    }
  } else {
    console.warn("System named: " + sysName + " not found.");
  }
};

ECS.Entities.removeSystem = function(ent, sysName) {
  var sys = ECS.Systems[sysName];
  if (sys) {
    ent.cleanSystem(sysName);
    delete ent.s[sysName];
  } else {
    console.warn("No system named: " + sysName + ", can't remove.");
  }
};

ECS.Entities.serialize = function(ent) {
  var entInfos = {};
  entInfos.type = ent.type;
  entInfos.name = ent.name;
  entInfos.comp = {};
  for (var compName in ent.c) {
    if (compName !== "isDirty") {
      if (compName === "associatedZone") {
        entInfos.comp.associatedZone = true;
      } else if (compName === "appearance") {
        entInfos.comp.appearance = ent.c.appearance;
        entInfos.comp.appearance.scene = null;
        entInfos.comp.appearance.mesh = null;
      } else {
        entInfos.comp[compName] = ent.c[compName];
      }
    }
  }
  entInfos.sys = [];
  for (var sys in ent.s) {
    entInfos.sys.push(sys);
  }
  return JSON.stringify(entInfos);
};


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
    entitiesList: true,
    appearance:true,
    defaultZoneGUI: true,
    physicsRules: true
  },
  sys: ["dataLoader", "drawZone", "sunLighting", "physicsRules"]
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
  sys: ["storedInZoneContainer", "drawEntity", "walk"]
};
